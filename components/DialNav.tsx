"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { navItems } from "@/lib/data/nav";

const N = navItems.length;
const ROW_HEIGHT = 36;
/** Rows visible above/below the centered item before fading out completely. */
const VISIBLE_NEIGHBORS = 4;
const VISIBLE_ROWS = VISIBLE_NEIGHBORS * 2 + 1;
const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const EDGE_PADDING = (CONTAINER_HEIGHT - ROW_HEIGHT) / 2;
const SETTLE_DELAY = 160;
/** Render the list 3x so scrolling past the first/last item wraps seamlessly. */
const COPIES = 3;
const RAIL_WIDTH = 22;

// A smooth, non-linear fade: full opacity for the centered row, easing out
// over the 4 rows to either side, fully transparent by the container edge.
const FADE_MASK = [
  "transparent 0%",
  "rgba(0,0,0,0.08) 8%",
  "rgba(0,0,0,0.3) 22%",
  "rgba(0,0,0,0.65) 34%",
  "black 46%",
  "black 54%",
  "rgba(0,0,0,0.65) 66%",
  "rgba(0,0,0,0.3) 78%",
  "rgba(0,0,0,0.08) 92%",
  "transparent 100%",
].join(", ");
const FADE_MASK_IMAGE = `linear-gradient(to bottom, ${FADE_MASK})`;

// Same color-stop-gradient technique as FADE_MASK above (not a blur filter,
// which feathers unevenly) — a clean, symmetric fade for the ScrollHint
// thumb's top/bottom edges.
const THUMB_GRADIENT = [
  "linear-gradient(to bottom",
  "transparent 0%",
  "var(--color-accent) 35%",
  "var(--color-accent) 65%",
  "transparent 100%)",
].join(", ");

function findActiveIndex(pathname: string) {
  const exact = navItems.findIndex((item) => item.href === pathname);
  if (exact !== -1) return exact;
  const prefixed = navItems.findIndex((item) =>
    pathname.startsWith(`${item.href}/`)
  );
  return prefixed !== -1 ? prefixed : 0;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

const HINT_THUMB_HEIGHT = 56;

// One-time scroll cue: a thin track spanning the full height of the dial,
// with a thumb sweeping from top to bottom and back, then the whole thing
// fades away for good — reads as "this whole column scrolls" without
// moving any actual content (which read as a bug when it repeated on its
// own every 30s) or flooding the sidebar with a big glow (looked cheap).
function ScrollHint() {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMounted(false);
      return;
    }

    const travel = CONTAINER_HEIGHT - HINT_THUMB_HEIGHT;
    const easeInOutQuad = (t: number) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    let frameId: number;
    let position = 0;

    function animateTo(target: number, duration: number, onDone?: () => void) {
      const from = position;
      const delta = target - from;
      const start = performance.now();
      function step(now: number) {
        const t = Math.min((now - start) / duration, 1);
        position = from + delta * easeInOutQuad(t);
        if (thumbRef.current) {
          thumbRef.current.style.transform = `translateY(${position}px)`;
        }
        if (t < 1) frameId = requestAnimationFrame(step);
        else onDone?.();
      }
      frameId = requestAnimationFrame(step);
    }

    animateTo(travel, 900, () => animateTo(0, 900));

    const fadeTimer = window.setTimeout(() => setFading(true), 2000);
    const removeTimer = window.setTimeout(() => setMounted(false), 2500);
    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-2 top-0 overflow-hidden"
      style={{
        width: RAIL_WIDTH,
        height: CONTAINER_HEIGHT,
        maskImage: FADE_MASK_IMAGE,
        WebkitMaskImage: FADE_MASK_IMAGE,
      }}
    >
      <div
        ref={thumbRef}
        className={`rounded-full transition-opacity duration-500 ${
          fading ? "opacity-0" : "opacity-100"
        }`}
        style={{
          width: RAIL_WIDTH,
          height: HINT_THUMB_HEIGHT,
          background: THUMB_GRADIENT,
        }}
      />
    </div>
  );
}

/** Shortest signed step from `from` to `to` around an N-item circle. */
function shortestDelta(from: number, to: number) {
  const raw = to - from;
  let best = raw;
  for (const candidate of [raw - N, raw, raw + N]) {
    if (Math.abs(candidate) < Math.abs(best)) best = candidate;
  }
  return best;
}

export function DialNav() {
  const pathname = usePathname();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmatic = useRef(false);
  const hasMounted = useRef(false);

  // Index into the tripled list — always kept near the middle copy.
  const [focusedRaw, setFocusedRaw] = useState(
    () => N + findActiveIndex(pathname)
  );

  const scrollToRaw = useCallback((rawIndex: number, smooth: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    programmatic.current = true;
    el.scrollTo({
      top: rawIndex * ROW_HEIGHT,
      behavior: smooth ? "smooth" : "auto",
    });
    window.setTimeout(
      () => {
        programmatic.current = false;
      },
      smooth ? 500 : 50
    );
  }, []);

  useEffect(() => {
    const activeIndex = findActiveIndex(pathname);
    setFocusedRaw((prevRaw) => {
      // Step from wherever the dial actually is, never snap it back to a
      // "canonical" copy — that's what caused the long slide-around bug.
      const delta = shortestDelta(mod(prevRaw, N), activeIndex);
      const nextRaw = prevRaw + delta;
      scrollToRaw(nextRaw, hasMounted.current);
      hasMounted.current = true;
      return nextRaw;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Cmd+Up / Cmd+Down step to the previous/next tab, from anywhere on the page.
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (!event.metaKey) return;
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      event.preventDefault();
      const direction = event.key === "ArrowUp" ? -1 : 1;
      setFocusedRaw((prevRaw) => {
        const nextRaw = prevRaw + direction;
        scrollToRaw(nextRaw, true);
        const nextItem = navItems[mod(nextRaw, N)];
        if (nextItem && nextItem.href !== pathname) router.push(nextItem.href);
        return nextRaw;
      });
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [pathname, router, scrollToRaw]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    let rawIndex = Math.round(el.scrollTop / ROW_HEIGHT);

    // Seamlessly jump between copies so the list feels infinite.
    if (rawIndex < N * 0.5) {
      rawIndex += N;
      el.scrollTop = rawIndex * ROW_HEIGHT;
    } else if (rawIndex > N * (COPIES - 0.5)) {
      rawIndex -= N;
      el.scrollTop = rawIndex * ROW_HEIGHT;
    }

    setFocusedRaw(rawIndex);

    if (programmatic.current) return;

    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const target = navItems[mod(rawIndex, N)];
      if (target && target.href !== pathname) {
        router.push(target.href);
      }
    }, SETTLE_DELAY);
  }

  return (
    <nav className="relative" aria-label="Section navigation">
      {/* Static pill-shaped rail: always centered on the focused row. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-2 top-0 rounded-full"
        style={{
          width: RAIL_WIDTH,
          height: CONTAINER_HEIGHT,
          background: "var(--dial-rail-color)",
          maskImage: FADE_MASK_IMAGE,
          WebkitMaskImage: FADE_MASK_IMAGE,
        }}
      />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar relative snap-y snap-mandatory overflow-y-auto"
        style={{
          height: CONTAINER_HEIGHT,
          maskImage: FADE_MASK_IMAGE,
          WebkitMaskImage: FADE_MASK_IMAGE,
        }}
      >
        <div style={{ height: EDGE_PADDING }} aria-hidden="true" />
        {Array.from({ length: COPIES }).flatMap((_, copyIdx) =>
          navItems.map((item, itemIdx) => {
            const rawIndex = copyIdx * N + itemIdx;
            const focused = rawIndex === focusedRaw;
            return (
              <Link
                key={rawIndex}
                href={item.href}
                onClick={() => {
                  setFocusedRaw(rawIndex);
                  scrollToRaw(rawIndex, true);
                }}
                aria-current={focused ? "page" : undefined}
                className="flex w-full shrink-0 snap-center items-center gap-3 pl-2 pr-2"
                style={{ height: ROW_HEIGHT, scrollSnapStop: "always" }}
              >
                <span
                  className="relative z-10 flex shrink-0 items-center justify-center"
                  style={{ width: RAIL_WIDTH }}
                >
                  <span
                    className={`h-[3px] w-3.5 rounded-full transition-all duration-200 ${
                      focused ? "bg-dial-tick" : "bg-ink-faint/50"
                    }`}
                  />
                </span>
                <span
                  className={`text-sm uppercase tracking-wide transition-all duration-200 ${
                    focused
                      ? "font-semibold text-ink"
                      : "font-medium text-dial-inactive"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })
        )}
        <div style={{ height: EDGE_PADDING }} aria-hidden="true" />
      </div>

      <ScrollHint />
    </nav>
  );
}
