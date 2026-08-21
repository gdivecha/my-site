"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type TransitionEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { APP_LOADED_AT } from "@/lib/app-load-time";
import { isDialSoundMuted } from "@/lib/dial-sound";
import { navItems } from "@/lib/data/nav";
import { onPageReady } from "@/lib/page-ready";
import { LockIcon } from "./icons";
import {
  MOBILE_SIDEBAR_CASCADE_DONE_MS,
  NUDGE_START_DELAY_MS,
  REASONABLE_LOAD_WAIT_MS,
  SIDEBAR_CASCADE_DONE_MS,
} from "@/lib/entrance-timing";

const N = navItems.length;
const ROW_HEIGHT = 36;
// Load-bearing for every scroll-position calculation below (scrollToRaw,
// handleScroll, handleScrollEnd, the nudge's SWING) — deliberately NOT
// made viewport-dependent like VISIBLE_NEIGHBORS/CONTAINER_HEIGHT/
// EDGE_PADDING below, since changing it would mean rederiving all of
// that math per-viewport too. Also comfortably clears WCAG 2.5.8 (AA)'s
// 24px minimum tap-target size on its own, so there's no accessibility
// reason to shrink it on small screens either.
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
// Same fade curve, sideways — for the horizontal mobile bar below.
const FADE_MASK_IMAGE_H = `linear-gradient(to right, ${FADE_MASK})`;

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

/** Lingers the lock icon in the DOM just long enough to play an exit
 * animation instead of vanishing the instant `show` flips false — plain
 * conditional rendering has no exit transition at all, since the element
 * is gone before any CSS could animate it. Enter uses a slight overshoot
 * (a "back out" easing curve) so it reads as a small organic pop rather
 * than a mechanical fade; exit is a plain, quicker fade+shrink with no
 * overshoot, like settling rather than springing. */
function AnimatedLock({
  show,
  badge = false,
}: {
  show: boolean;
  /** Wraps the icon in its own small circular background — for the
   * mobile bar's standalone corner badge (see below), which has no
   * adjacent label text of its own to sit next to the way the vertical
   * dial's inline usage does. Kept inside this component rather than
   * added at each call site so the background shares the exact same
   * rendered/entered lifecycle as the icon — appearing and
   * (importantly) playing its exit fade in sync with it, not vanishing
   * abruptly the instant `show` flips false while the icon's own exit
   * animation is still mid-flight. */
  badge?: boolean;
}) {
  const [rendered, setRendered] = useState(show);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (show) {
      setRendered(true);
      // Mount in the "hidden" state first, then flip to "entered" a couple
      // of frames later — flipping both in the same commit gives the
      // browser nothing to animate from (no prior painted frame at the
      // hidden state to transition away from). A single rAF can still
      // land in the same frame as the mount's own paint depending on
      // timing, so this nests two: the first guarantees we're past that
      // paint, the second is where the class flip actually happens.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setEntered(false);
  }, [show]);

  if (!rendered) return null;

  const handleTransitionEnd = (event: TransitionEvent) => {
    if (event.propertyName !== "opacity") return;
    if (!show) setRendered(false);
  };

  if (badge) {
    // A plain fade, deliberately not the spring/rotate treatment below —
    // that reads right sitting inline next to text on the vertical
    // dial, but this is its own free-floating popup with nothing beside
    // it to play off of, so a bounce there just reads as jittery rather
    // than purposeful. The icon fades as one unit with its circle, not
    // separately — no independent motion of its own.
    // border-accent/50 + text-accent-soft, not the plain border-line/
    // text-ink-soft this used to be — a lock this muted (essentially the
    // same tone as the rest of the quiet chrome around it) was easy to
    // miss entirely despite marking a real "don't navigate yet" state.
    // The accent color already reads as "something active" everywhere
    // else on this site (the focused nav tab, an active filter), so
    // reusing it here is a legible, non-gimmicky way to make it stand
    // out rather than inventing a new attention cue.
    return (
      <div
        // rgb(109,95,232) is --color-accent's literal value — that one
        // token is identical in both themes (unlike accent-soft/-deep),
        // so it's safe to inline here for the glow ring without a CSS
        // var that doesn't otherwise exist.
        className="flex h-6 w-6 items-center justify-center rounded-full border border-accent/50 bg-icon-btn shadow-[0_0_0_3px_rgba(109,95,232,0.25)]"
        style={{
          opacity: entered ? 1 : 0,
          transition: "opacity 200ms ease-out",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <LockIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-accent-soft" />
      </div>
    );
  }

  // Plain inline styles rather than swapping Tailwind utility classes —
  // this animation only has two states and needs to be unambiguous about
  // exactly which properties transition and for how long.
  const animatedStyle: CSSProperties = {
    transformOrigin: "50% 50%",
    opacity: entered ? 1 : 0,
    transform: entered ? "scale(1) rotate(0deg)" : "scale(0.4) rotate(-25deg)",
    transition: entered
      ? "transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 260ms ease-out"
      : "transform 220ms ease-in, opacity 200ms ease-in",
  };

  // text-accent-soft, not text-ink-faint — same reasoning as the badge
  // variant above: this marks a real "don't navigate yet" state and was
  // too easy to miss at the same quiet tone as everything around it.
  return (
    <LockIcon
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 text-accent-soft"
      style={animatedStyle}
      onTransitionEnd={handleTransitionEnd}
    />
  );
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
  // Mobile horizontal bar's own scroll container and per-item center
  // positions — see the isCompact layout effect further down. Items
  // aren't a fixed pitch like the vertical dial's rows (labels range
  // from "Home" to "Recommendations"), so their positions have to be
  // measured off the actual rendered DOM rather than computed from a
  // constant.
  const hScrollRef = useRef<HTMLDivElement>(null);
  const hItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hCentersRef = useRef<number[]>([]);

  // Below md (768px — the same breakpoint Sidebar itself switches on:
  // that's where it stops being a fixed, full-height column and starts
  // stacking in normal document flow above page content), the dial's
  // fixed 324px height is real vertical space a mobile visitor has to
  // scroll past before reaching anything else. Shrinking the visible
  // window there (5 rows instead of 9) keeps the dial itself — its row
  // height, tap targets, and every scroll-position calculation above —
  // completely untouched; only how much of it shows at once changes.
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  /** Rows visible above/below the centered item before fading out completely. */
  const VISIBLE_NEIGHBORS = isCompact ? 2 : 4;
  const VISIBLE_ROWS = VISIBLE_NEIGHBORS * 2 + 1;
  const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
  const EDGE_PADDING = (CONTAINER_HEIGHT - ROW_HEIGHT) / 2;

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
      // isCompact (mobile) uses its own shorter cascade — see
      // entrance-timing.ts — so under reduced motion, this lock
      // releases on the same schedule the rest of the mobile entrance
      // (icons, page content) actually settles on, not desktop's longer
      // one.
      const cascadeDoneMs = isCompact
        ? MOBILE_SIDEBAR_CASCADE_DONE_MS
        : SIDEBAR_CASCADE_DONE_MS;
      const remaining = Math.max(0, cascadeDoneMs - (Date.now() - APP_LOADED_AT));
      const timer = window.setTimeout(() => {
        setSeeking(false);
        playDialTick();
      }, remaining);
      return () => window.clearTimeout(timer);
    }
    // isCompact is intentionally excluded — this effect is documented
    // (see above) to only ever run once, on the genuine first mount;
    // isCompact has already resolved to its real value by then (its own
    // effect is declared earlier in this component, so it fires first
    // within the same initial commit), and re-running this on a later
    // resize would incorrectly re-arm a lock-release that's only
    // supposed to happen once per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const scrollToRaw = useCallback(
    (rawIndex: number, smooth: boolean) => {
      if (isCompact) {
        const el = hScrollRef.current;
        const center = hCentersRef.current[rawIndex];
        if (!el || center === undefined) return;
        programmatic.current = true;
        el.scrollTo({
          left: center - el.clientWidth / 2,
          behavior: smooth ? "smooth" : "auto",
        });
        // A fixed short delay (what the vertical dial uses below) isn't
        // safe here: rows are a small, constant 36px apart, so native
        // smooth-scroll always settles well under 500ms. Horizontal
        // labels can be much further apart (jumping between the tripled
        // copies, or just "Home" to "Recommendations"), so that same
        // smooth-scroll can genuinely still be mid-flight past 500ms —
        // if the guard lifts before it actually settles, an in-between
        // scroll event reads a transient position and stomps the correct
        // focus with whatever tab happened to be passing by. scrollend
        // clears it exactly when the scroll truly stops instead; the
        // timeout is only a fallback for browsers without that event.
        if (smooth && "onscrollend" in window) {
          const clearProgrammatic = () => {
            programmatic.current = false;
            el.removeEventListener("scrollend", clearProgrammatic);
          };
          el.addEventListener("scrollend", clearProgrammatic);
          window.setTimeout(clearProgrammatic, 1200);
        } else {
          window.setTimeout(
            () => {
              programmatic.current = false;
            },
            smooth ? 500 : 50
          );
        }
        return;
      }
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
    },
    [isCompact]
  );

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

  // Measures each rendered item's horizontal center (see hCentersRef
  // above) once the mobile bar actually exists, and jumps it straight to
  // the already-known focused item — no animation, mirroring how the
  // vertical dial positions itself on mount. Re-measures on resize and
  // once fonts finish loading, since these widths come from rendered
  // text, not a fixed constant, so anything that can reflow the label
  // widths has to refresh them.
  useLayoutEffect(() => {
    if (!isCompact) return;
    const el = hScrollRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const containerRect = el.getBoundingClientRect();
      hCentersRef.current = hItemRefs.current.map((item) => {
        if (!item) return 0;
        const itemRect = item.getBoundingClientRect();
        return itemRect.left - containerRect.left + el.scrollLeft + itemRect.width / 2;
      });
    }

    measure();
    const center = hCentersRef.current[focusedRawRef.current];
    if (center !== undefined) {
      el.scrollLeft = center - el.clientWidth / 2;
    }

    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [isCompact]);

  // One-time scroll nudge on page load: up, down past rest, up again, down
  // again (opposite the swing before it), then back to rest — four swings
  // whose position over time traces a sine/cosine curve (quick departure,
  // decelerating into each turning point) rather than a linear
  // back-and-forth. Snap is briefly disabled so the swing can land
  // off-grid instead of the browser correcting it back to a row.
  const [peeking, setPeeking] = useState(false);
  useEffect(() => {
    const el = isCompact ? hScrollRef.current : scrollRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The down leg travels from +SWING to -SWING in one continuous sweep
    // (2×SWING total), so this needs to stay under half a row/item or
    // that middle leg blows past the neighboring tab and reads as a
    // snap. The vertical dial derives this from its fixed row height;
    // the horizontal bar has no fixed pitch (labels range from "Home" to
    // "Recommendations"), so it uses a flat pixel amount tuned to read
    // the same way.
    const SWING = isCompact ? 14 : ROW_HEIGHT * 0.45;

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
        const value = from + delta * ease(t);
        if (isCompact) el.scrollLeft = value;
        else el.scrollTop = value;
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
      // directly driving the scroll position itself via rAF the whole
      // time it runs, and real scroll/click input arriving mid-swing
      // would fight that animation. seeking already gates both the lock
      // icon (next to the real focused tab, which doesn't change during
      // the swing) and pointer-events-none on the scroll container —
      // reusing it here covers the nudge with the same actual lock, not
      // a second one.
      setSeeking(true);
      const rest = isCompact ? el.scrollLeft : el.scrollTop;

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
  }, [nudgeDelayMs, isCompact]);

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

  // Cmd+Up/Down (Mac) or Ctrl+Up/Down (Windows/Linux) step to the
  // previous/next tab, from anywhere on the page.
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (!event.metaKey && !event.ctrlKey) return;
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

  /** Finds whichever measured item center is closest to the horizontal
   * bar's current visual center — the variable-pitch equivalent of the
   * vertical dial's `Math.round(scrollTop / ROW_HEIGHT)`. */
  function closestRawIndex(el: HTMLDivElement) {
    const target = el.scrollLeft + el.clientWidth / 2;
    const centers = hCentersRef.current;
    let rawIndex = 0;
    let best = Infinity;
    centers.forEach((center, i) => {
      const distance = Math.abs(center - target);
      if (distance < best) {
        best = distance;
        rawIndex = i;
      }
    });
    return rawIndex;
  }

  function handleScrollH() {
    const el = hScrollRef.current;
    if (!el || hCentersRef.current.length === 0) return;
    let rawIndex = closestRawIndex(el);

    // Seamlessly jump between copies so the list feels infinite — same
    // idea as handleScroll above, just repositioning via a measured
    // center instead of a fixed row pitch.
    if (rawIndex < N * 0.5) {
      rawIndex += N;
      el.scrollLeft = hCentersRef.current[rawIndex] - el.clientWidth / 2;
    } else if (rawIndex > N * (COPIES - 0.5)) {
      rawIndex -= N;
      el.scrollLeft = hCentersRef.current[rawIndex] - el.clientWidth / 2;
    }

    if (programmatic.current) return;

    setFocusedRaw(rawIndex);

    if (rawIndex !== lastTickedRawRef.current) {
      lastTickedRawRef.current = rawIndex;
      playDialTick();
    }

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

  useEffect(() => {
    const el = hScrollRef.current;
    if (!isCompact || !el || !("onscrollend" in window)) return;

    function handleScrollEndH() {
      if (!el || programmatic.current || hCentersRef.current.length === 0) return;
      const rawIndex = closestRawIndex(el);
      const target = navItems[mod(rawIndex, N)];
      if (target && target.href !== pathname) {
        router.push(target.href);
      }
    }

    el.addEventListener("scrollend", handleScrollEndH);
    return () => el.removeEventListener("scrollend", handleScrollEndH);
  }, [isCompact, pathname, router]);

  return (
    <>
      {!isCompact && (
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
                      {focused && <AnimatedLock show={seeking} />}
                    </span>
                  </Link>
                );
              })
            )}
            <div style={{ height: EDGE_PADDING }} aria-hidden="true" />
          </div>
        </nav>
      )}

      {/* Mobile: horizontal, fixed to the bottom of the viewport — portaled
          to document.body rather than rendered in place, since Sidebar's
          own entrance-cascade wrapper around this component applies a
          translate-y transform, and a transformed ancestor becomes the
          containing block for any position:fixed descendant instead of
          the viewport (the same issue ScrollHint hit earlier). Portaling
          is the same fix already used elsewhere in this codebase
          (SearchModal, KeyboardShortcuts) for exactly this problem. */}
      {isCompact &&
        typeof document !== "undefined" &&
        createPortal(
          <nav
            aria-label="Section navigation"
            data-dial-nav
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-sidebar-sticky-bg backdrop-blur-[6px]"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div
              ref={hScrollRef}
              onScroll={handleScrollH}
              className={`no-scrollbar relative flex items-center overflow-x-auto overflow-y-hidden ${
                peeking ? "" : "snap-x snap-mandatory"
              } ${seeking ? "pointer-events-none" : ""}`}
              style={{
                height: 56,
                maskImage: FADE_MASK_IMAGE_H,
                WebkitMaskImage: FADE_MASK_IMAGE_H,
                touchAction: "pan-x",
              }}
            >
              <div style={{ width: "50vw", flexShrink: 0 }} aria-hidden="true" />
              {Array.from({ length: COPIES }).flatMap((_, copyIdx) =>
                navItems.map((item, itemIdx) => {
                  const rawIndex = copyIdx * N + itemIdx;
                  const focused = rawIndex === focusedRaw;
                  return (
                    <Link
                      key={rawIndex}
                      href={item.href}
                      ref={(node) => {
                        hItemRefs.current[rawIndex] = node;
                      }}
                      onClick={() => {
                        setFocusedRaw(rawIndex);
                        lastTickedRawRef.current = rawIndex;
                        scrollToRaw(rawIndex, true);
                      }}
                      aria-current={focused ? "page" : undefined}
                      className="flex shrink-0 snap-center items-center px-4"
                      style={{ scrollSnapStop: "always" }}
                    >
                      <span
                        className={`whitespace-nowrap text-sm uppercase tracking-wide transition-all duration-200 ${
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
              <div style={{ width: "50vw", flexShrink: 0 }} aria-hidden="true" />
            </div>
            {/* Independent of the scrolling label row (which is why it's
                a sibling here, not inline with the focused label the way
                the vertical dial does it) — a small popup floating just
                above the bar, centered on it horizontally, rather than
                squeezed into its 56px-tall row next to whatever the
                current label's text happens to be. bottom-full (not
                top-*) is what puts it above rather than inside the bar;
                the mb-2 adds the actual gap, since bottom-full alone
                would butt its edge flush against the bar's own top edge
                with none. left-1/2 -translate-x-1/2 centers it — the bar
                itself spans the full viewport width, so centering on
                that centers it on-screen too, not just within whatever
                the currently-scrolled label happens to be. badge=true
                gets AnimatedLock its own circular background (see its
                definition) instead of a separate wrapper here, so the
                background shares the icon's exact enter/exit lifecycle
                rather than vanishing the instant `seeking` flips false
                while the icon's own exit animation is still playing. */}
            <div
              className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2"
              aria-hidden="true"
            >
              <AnimatedLock show={seeking} badge />
            </div>
          </nav>,
          document.body
        )}
    </>
  );
}
