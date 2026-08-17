"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { APP_LOADED_AT } from "@/lib/app-load-time";
import { isDialSoundMuted } from "@/lib/dial-sound";
import { navItems } from "@/lib/data/nav";
import { onPageReady } from "@/lib/page-ready";
import { LockIcon } from "./icons";
import {
  NUDGE_START_DELAY_MS,
  REASONABLE_LOAD_WAIT_MS,
  SIDEBAR_CASCADE_DONE_MS,
} from "@/lib/entrance-timing";

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

// Quick departure, decelerating into the stop — used for the outbound leg
// of each swing in the nudge below (a quarter-cosine curve).
const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2);
// Starts and ends at rest, symmetric acceleration/deceleration — used for
// the final return leg, which starts from a dead stop at the trough.
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** Shortest signed step from `from` to `to` around an N-item circle. */
function shortestDelta(from: number, to: number) {
  const raw = to - from;
  let best = raw;
  for (const candidate of [raw - N, raw, raw + N]) {
    if (Math.abs(candidate) < Math.abs(best)) best = candidate;
  }
  return best;
}

/** A short synthesized detent click — no audio file, no network request,
 * nothing that could ever cost anything: ~10ms of filtered noise (the
 * physical, mechanical part of a real detent — a knob or click-wheel
 * isn't a clean tone, it's a broadband transient) layered with a very
 * brief tonal "snap" that decays almost immediately, not a ring. That
 * combination is what a physical dial actually sounds like — noise
 * alone read as dull/dead, a longer pure tone read as a musical
 * game-console chime. */
let dialAudioCtx: AudioContext | null = null;
let dialNoiseBuffer: AudioBuffer | null = null;

function getAudioCtxClass() {
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

// Browsers only unlock Web Audio on an actual "activation-triggering"
// input event — click, keydown, pointerdown, touchend — and `scroll`/
// `wheel` (the only thing that ever calls playDialTick, below) isn't one
// of them. Without this, `AudioContext.resume()` never resolves and the
// dial stays silent forever, not just on the first tick. Any real
// gesture anywhere on the page — not necessarily on the dial itself —
// satisfies it, so this just grabs the first one it sees.
if (typeof window !== "undefined") {
  const unlockDialAudio = () => {
    try {
      const Ctx = getAudioCtxClass();
      if (!Ctx) return;
      if (!dialAudioCtx) dialAudioCtx = new Ctx();
      if (dialAudioCtx.state === "suspended") dialAudioCtx.resume();
    } catch {
      // Nice-to-have; never worth surfacing an error over.
    }
  };
  window.addEventListener("pointerdown", unlockDialAudio, { once: true });
  window.addEventListener("keydown", unlockDialAudio, { once: true });
  window.addEventListener("touchend", unlockDialAudio, { once: true });
}

function emitDialTick(ctx: AudioContext) {
  // Mechanical part: a short noise transient through a fairly wide
  // bandpass — the "physical contact" of the detent.
  const noiseDuration = 0.012;
  if (!dialNoiseBuffer) {
    const length = Math.ceil(ctx.sampleRate * noiseDuration);
    dialNoiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = dialNoiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = dialNoiseBuffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 3200;
  noiseFilter.Q.value = 0.7;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.18, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + noiseDuration);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start();
  noise.stop(ctx.currentTime + noiseDuration);

  // Tonal part: barely a ring, just enough pitch to keep it from
  // sounding like a dead thud.
  const snapDuration = 0.035;
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 2800;
  oscGain.gain.setValueAtTime(0.05, ctx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + snapDuration);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + snapDuration);
}

function playDialTick() {
  if (isDialSoundMuted()) return;
  try {
    const Ctx = getAudioCtxClass();
    if (!Ctx) return;
    if (!dialAudioCtx) dialAudioCtx = new Ctx();
    const ctx = dialAudioCtx;

    if (ctx.state === "suspended") {
      // Scheduling nodes against a clock that hasn't started yet produces
      // no audible sound even once resume() eventually succeeds — their
      // very short stop times (12ms/35ms), computed from a currentTime
      // that isn't advancing, can already be in the past by the time
      // playback actually begins. Wait for resume to genuinely complete,
      // then emit against the now-running clock, rather than firing
      // blind. If nothing has unlocked audio yet (see above), this
      // promise simply never resolves and the tick is silently skipped —
      // exactly as before, just without a dead scheduling race on top.
      ctx.resume().then(() => emitDialTick(ctx));
      return;
    }
    emitDialTick(ctx);
  } catch {
    // Web Audio unavailable/blocked — the tick is a nice-to-have, never
    // worth breaking navigation over.
  }
}

export function DialNav({
  nudgeDelayMs = NUDGE_START_DELAY_MS,
}: {
  /** How long, from mount, before the load-time nudge below fires. DialNav
   * itself always appears on its own normal schedule (wherever its caller
   * places it) — this only defers the nudge *motion*, e.g. so it doesn't
   * play while the page's right-side content is still animating in. */
  nudgeDelayMs?: number;
} = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmatic = useRef(false);
  const hasMounted = useRef(false);

  // Locks the dial (real lock — see the pointer-events-none tie-in
  // below — plus the inline lock icon next to the focused tab) from
  // mount, staying locked straight through into the load-time nudge
  // below with no gap in between: if motion is enabled, THIS effect
  // never releases it — the nudge effect is what eventually does, once
  // its swings finish — so there's no window where someone could
  // reselect a tab between "page ready" and "nudge done". Only when
  // motion is disabled (no nudge will ever run) does this effect release
  // it itself, once the page's own entrance cascade has actually
  // finished (the same SIDEBAR_CASCADE_DONE_MS moment PageShell waits
  // for before revealing a page's content). DialNav itself never
  // unmounts across client-side navigation (it lives in the persistent
  // (sections) layout), so this initial lock can only ever happen once,
  // on a genuine first load.
  const [seeking, setSeeking] = useState(true);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const remaining = Math.max(
        0,
        SIDEBAR_CASCADE_DONE_MS - (Date.now() - APP_LOADED_AT)
      );
      const timer = window.setTimeout(() => {
        setSeeking(false);
        playDialTick();
      }, remaining);
      return () => window.clearTimeout(timer);
    }
  }, []);

  // Re-locks on every later navigation too, not just the first load —
  // but only actually shows the lock if the new tab's page is genuinely
  // slow to become available. Waits on the real "this page is ready"
  // signal from PageShell (onPageReady) rather than guessing from paint
  // timing, so it's tied to the same readiness this site's pages
  // actually use — for local, synchronous pages that's essentially
  // instant, so most navigations show nothing at all; the lock only
  // appears if REASONABLE_LOAD_WAIT_MS passes first, a real stall, not
  // routine per-navigation flicker. isFirstPathChange skips exactly the
  // mount's own run of this effect, which the effect above already owns.
  const isFirstPathChange = useRef(true);
  useEffect(() => {
    if (isFirstPathChange.current) {
      isFirstPathChange.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let didShowLock = false;
    const showLockTimer = window.setTimeout(() => {
      didShowLock = true;
      setSeeking(true);
    }, REASONABLE_LOAD_WAIT_MS);

    const unsubscribe = onPageReady(() => {
      window.clearTimeout(showLockTimer);
      setSeeking(false);
      if (didShowLock) playDialTick();
    });

    return () => {
      window.clearTimeout(showLockTimer);
      unsubscribe();
    };
  }, [pathname]);

  // Index into the tripled list — always kept near the middle copy.
  const [focusedRaw, setFocusedRaw] = useState(
    () => N + findActiveIndex(pathname)
  );
  // Mirrors focusedRaw for handleKeydown to read synchronously — that
  // handler needs the latest index to compute a router.push, and doing
  // that inside a setFocusedRaw(prev => ...) updater (the alternative)
  // triggers React's "Cannot update Router while rendering DialNav" error,
  // since updater callbacks are expected to be pure.
  const focusedRawRef = useRef(focusedRaw);
  // Which index the tick sound last played for — updated synchronously
  // everywhere focus changes (this ref, unlike focusedRawRef above,
  // can't wait for an effect to catch up: handleScroll needs to compare
  // against it within the same synchronous scroll event, not a render
  // later) so a real user scroll never re-ticks a tab it's already
  // ticked, and switching tabs by click/keyboard doesn't leave a stale
  // value that fires a spurious tick on the next scroll.
  const lastTickedRawRef = useRef(focusedRaw);
  useEffect(() => {
    focusedRawRef.current = focusedRaw;
  }, [focusedRaw]);

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
      lastTickedRawRef.current = nextRaw;
      return nextRaw;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // One-time scroll nudge on page load: up, down past rest, up again, down
  // again (opposite the swing before it), then back to rest — four swings
  // whose position over time traces a sine/cosine curve (quick departure,
  // decelerating into each turning point) rather than a linear
  // back-and-forth. Snap is briefly disabled so the swing can land
  // off-grid instead of the browser correcting it back to a row.
  const [peeking, setPeeking] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The down leg travels from +SWING to -SWING in one continuous sweep
    // (2×SWING total), so this needs to stay under half a row or that
    // middle leg covers more than a full row and visually blows past the
    // neighboring tab, reading as a snap. 0.45 leaves a small margin
    // (2×SWING ≈ 0.9 of a row) while still reading clearly as motion.
    const SWING = ROW_HEIGHT * 0.45;

    let frameId: number;

    function animate(
      from: number,
      to: number,
      duration: number,
      ease: (t: number) => number,
      onDone?: () => void
    ) {
      if (!el) return;
      const delta = to - from;
      const start = performance.now();
      function step(now: number) {
        if (!el) return;
        const t = Math.min((now - start) / duration, 1);
        el.scrollTop = from + delta * ease(t);
        if (t < 1) frameId = requestAnimationFrame(step);
        else onDone?.();
      }
      frameId = requestAnimationFrame(step);
    }

    const timer = window.setTimeout(() => {
      if (!el) return;
      programmatic.current = true;
      setPeeking(true);
      // Also a genuine lock, not just the visual cue: the nudge is
      // directly driving el.scrollTop itself via rAF the whole time it
      // runs, and real scroll/click input arriving mid-swing would fight
      // that animation. seeking already gates both the lock icon (next
      // to the real focused tab, which doesn't change during the swing)
      // and pointer-events-none on the scroll container — reusing it
      // here covers the nudge with the same actual lock, not a second
      // one.
      setSeeking(true);
      const rest = el.scrollTop;

      animate(rest, rest - SWING, 360, easeOutSine, () => {
        animate(rest - SWING, rest + SWING, 620, easeOutSine, () => {
          animate(rest + SWING, rest - SWING, 620, easeOutSine, () => {
            animate(rest - SWING, rest + SWING, 620, easeOutSine, () => {
              animate(rest + SWING, rest, 600, easeInOutSine, () => {
                programmatic.current = false;
                setPeeking(false);
                setSeeking(false);
              });
            });
          });
        });
      });
    }, nudgeDelayMs);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [nudgeDelayMs]);

  // While the dial is locked, the page itself shouldn't be scrollable
  // either — otherwise the mouse wheel/trackpad can still move the
  // underlying page while the dial visibly refuses to respond, which
  // reads as broken rather than "still loading".
  useEffect(() => {
    if (!seeking) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [seeking]);

  // Cmd+Up / Cmd+Down step to the previous/next tab, from anywhere on the page.
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (!event.metaKey) return;
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      // Same lock the dial itself observes (pointer-events-none, above) —
      // a keyboard shortcut shouldn't be able to do what a click/scroll
      // currently can't.
      if (seeking) return;

      event.preventDefault();
      const direction = event.key === "ArrowUp" ? -1 : 1;
      const nextRaw = focusedRawRef.current + direction;
      setFocusedRaw(nextRaw);
      lastTickedRawRef.current = nextRaw;
      scrollToRaw(nextRaw, true);
      playDialTick();
      const nextItem = navItems[mod(nextRaw, N)];
      if (nextItem && nextItem.href !== pathname) router.push(nextItem.href);
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [pathname, router, scrollToRaw, seeking]);

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

    // Skip while a programmatic scroll (click, keyboard step, or the
    // load-time nudge) is in flight — those already set focus explicitly
    // themselves, and without this guard the swing's off-grid scrollTop
    // would flip the bold/tick indicator to a neighboring row mid-animation.
    if (programmatic.current) return;

    setFocusedRaw(rawIndex);

    // One tick per tab actually crossed, like a real dial's detent — not
    // once per scroll event, which fires many times per row.
    if (rawIndex !== lastTickedRawRef.current) {
      lastTickedRawRef.current = rawIndex;
      playDialTick();
    }

    // Navigation itself is driven by the native `scrollend` event below,
    // not from here — trackpad/wheel scrolling can have real gaps
    // between individual scroll events even mid-gesture (e.g. while
    // decelerating past a row), and a fixed debounce here was firing
    // during one of those gaps, navigating to a tab the user was still
    // scrolling past rather than the one they meant to land on. Only
    // browsers without `scrollend` support fall back to that debounce.
    if (!("onscrollend" in window)) {
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        const target = navItems[mod(rawIndex, N)];
        if (target && target.href !== pathname) {
          router.push(target.href);
        }
      }, SETTLE_DELAY);
    }
  }

  // Primary "commit the navigation" path: fires once the browser
  // considers scrolling (including momentum/inertial coasting) to have
  // actually stopped — unlike `scroll`, which fires continuously
  // throughout the gesture. See the `programmatic` guard note above.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !("onscrollend" in window)) return;

    function handleScrollEnd() {
      if (!el || programmatic.current) return;
      const rawIndex = Math.round(el.scrollTop / ROW_HEIGHT);
      const target = navItems[mod(rawIndex, N)];
      if (target && target.href !== pathname) {
        router.push(target.href);
      }
    }

    el.addEventListener("scrollend", handleScrollEnd);
    return () => el.removeEventListener("scrollend", handleScrollEnd);
  }, [pathname, router]);

  return (
    <nav className="relative" aria-label="Section navigation" data-dial-nav>
      {/* Static pill-shaped rail: always centered on the focused row. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 rounded-full"
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
        className={`no-scrollbar relative overflow-x-hidden overflow-y-auto ${
          peeking ? "" : "snap-y snap-mandatory"
        } ${
          // The seeking overlay above is itself pointer-events-none (it
          // has to be, to stay purely decorative) — without this, the
          // real rows underneath stayed fully scrollable/clickable the
          // whole time, just invisibly, while it looked locked. This is
          // the actual lock; the overlay is only ever what makes it
          // visible.
          seeking ? "pointer-events-none" : ""
        }`}
        style={{
          height: CONTAINER_HEIGHT,
          maskImage: FADE_MASK_IMAGE,
          WebkitMaskImage: FADE_MASK_IMAGE,
          // Setting overflow-y alone quietly computes overflow-x to
          // auto too (a CSS spec quirk), which let a horizontal
          // trackpad swipe or shift+wheel nudge the dial sideways —
          // explicit overflow-x-hidden above covers mouse/trackpad
          // input; touch-action further stops touchscreen panning from
          // moving it on the x-axis, leaving y untouched.
          touchAction: "pan-y",
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
                  lastTickedRawRef.current = rawIndex;
                  scrollToRaw(rawIndex, true);
                }}
                aria-current={focused ? "page" : undefined}
                className="flex w-full shrink-0 snap-center items-center gap-3 pr-2"
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
                  className={`flex items-center gap-2 text-sm uppercase tracking-wide transition-all duration-200 ${
                    focused
                      ? "font-semibold text-ink"
                      : "font-medium text-dial-inactive"
                  }`}
                >
                  {item.label}
                  {focused && seeking && (
                    <LockIcon
                      aria-hidden="true"
                      className="h-3 w-3 shrink-0 text-ink-faint"
                    />
                  )}
                </span>
              </Link>
            );
          })
        )}
        <div style={{ height: EDGE_PADDING }} aria-hidden="true" />
      </div>

    </nav>
  );
}
