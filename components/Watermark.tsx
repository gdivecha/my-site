"use client";

import { useLayoutEffect, useRef, useState } from "react";

const ROWS = 44;
// Each row scrolls two back-to-back copies of some number of repetitions
// and loops by jumping from translateX(-50%) back to 0 — seamless only
// if a single copy is already wider than the row's full visible span.
// That required repeat count depends on both the word's length and the
// viewport width, so it's measured and corrected below rather than fixed
// — a flat constant is either wrong for short words on wide screens (a
// real, periodic gap once per loop — this happened at 8) or wildly
// over-provisioned for long words (extra DOM nodes doing nothing, this
// happened at 30, sized for the worst case regardless of actual page).
const INITIAL_REPEATS = 10;
const MIN_REPEATS = 4;
const MAX_REPEATS = 40;
const PIXELS_PER_SECOND = 9;

/** Builds a wavy band as an inline SVG (a filled path, blurred for a
 * soft edge — same idea as the plain CSS gradient's transparent-to-
 * opaque-to-transparent ramp this replaces, just no longer a straight-
 * edged shape), encoded as a data URI so it can be dropped straight
 * into mask-image and animated with the same mask-position sweep the
 * rest of the shimmer already uses.
 *
 * `orientation` picks which axis the band spans and which edges get the
 * wave: "vertical" (desktop, sweeps right-to-left) is a band spanning
 * the full height with wavy left/right edges; "horizontal" (mobile,
 * sweeps bottom-to-top) is a band spanning the full width with wavy
 * top/bottom edges instead — see the matching mask-size/keyframes pair
 * for each in globals.css.
 *
 * Both wavy edges get their own independently-random amplitude,
 * frequency, and phase — not the same wave mirrored on both sides,
 * which would only ever produce a constant-width wavy *ribbon*.
 * Independent edges let the band's width itself vary unevenly along its
 * length each time, which is what actually makes every session's
 * proportions look different rather than just its position along one
 * repeating curve. */
function buildWavyMaskDataUri(orientation: "vertical" | "horizontal"): string {
  const size = 100;
  const steps = 48;
  const center = 50;
  // Narrower band — a slim streak passing through rather than a wide
  // swath covering a third of the screen at once. Deliberately NOT
  // touched to fix this: mask-size/mask-position in globals.css (those
  // control the sweep's travel distance and direction, already tuned and
  // easy to re-break) — only how much of that traveled width is actually
  // opaque.
  const halfWidth = 5;

  function edgePos(i: number, amplitude: number, frequency: number, phase: number) {
    const pos = (i / steps) * size;
    return center + Math.sin((pos / size) * Math.PI * 2 * frequency + phase) * amplitude;
  }

  const amp1 = 2 + Math.random() * 4.25;
  const freq1 = 1.5 + Math.random() * 3.5;
  const phase1 = Math.random() * Math.PI * 2;
  const amp2 = 2 + Math.random() * 4.25;
  const freq2 = 1.5 + Math.random() * 3.5;
  const phase2 = Math.random() * Math.PI * 2;

  const edge1: string[] = [];
  const edge2: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const pos = (i / steps) * size;
    const e1 = (edgePos(i, amp1, freq1, phase1) - halfWidth).toFixed(2);
    const e2 = (edgePos(i, amp2, freq2, phase2) + halfWidth).toFixed(2);
    if (orientation === "vertical") {
      edge1.push(`${e1},${pos.toFixed(2)}`);
      edge2.push(`${e2},${pos.toFixed(2)}`);
    } else {
      edge1.push(`${pos.toFixed(2)},${e1}`);
      edge2.push(`${pos.toFixed(2)},${e2}`);
    }
  }
  const d = `M ${edge1.join(" L ")} L ${edge2.reverse().join(" L ")} Z`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<filter id="b"><feGaussianBlur stdDeviation="2.4" /></filter>` +
    `<path d="${d}" fill="white" filter="url(#b)" />` +
    `</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function Watermark({
  text,
  waving = false,
}: {
  text: string;
  /** Reveals a second, bright copy of this same watermark through a
   * single traveling mask band — see .watermark-plane--bright in
   * globals.css, and PageShell.tsx's own "reasonable wait" threshold
   * for when this actually gets set. */
  waving?: boolean;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  // Row 0's dim track — read directly for its live, browser-tracked
  // animation position (see the sync effect below), rather than
  // estimating elapsed time in JS.
  const dimTrackRef = useRef<HTMLDivElement>(null);
  const brightPlaneRef = useRef<HTMLDivElement>(null);
  const [repeats, setRepeats] = useState(INITIAL_REPEATS);
  // Guards the convergence loop below — measure width, adjust repeats,
  // remeasure — against never actually converging. It normally settles
  // in 1-2 passes since width scales with repeats, but for some exact
  // text-length/viewport-width combinations (confirmed: "CONTACT" at
  // exactly 375px, though presumably not unique to that pair) the
  // computed target oscillates between two values instead of settling,
  // and re-runs fast enough to blow past React's own update-depth limit
  // — a real crash, not just a layout glitch. Capping attempts trades a
  // very occasional slightly-off repeat count for never crashing the
  // page outright.
  const syncAttemptsRef = useRef(0);
  // This session's wavy mask shape — generated fresh each time waving
  // starts, reset to null once waving ends — not re-rolled on every
  // re-render while it's true.
  const maskDataUriRef = useRef<string | null>(null);
  if (waving) {
    if (maskDataUriRef.current === null) {
      // Matches the same md breakpoint (767px) everything else on the
      // page uses for "mobile" — read live rather than cached in state
      // since this only ever runs once per waving session anyway (no
      // re-render to keep in sync with a resize crossing the breakpoint
      // mid-session).
      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 767px)").matches;
      maskDataUriRef.current = buildWavyMaskDataUri(
        isMobile ? "horizontal" : "vertical"
      );
    }
  } else {
    maskDataUriRef.current = null;
  }

  // Phase-locks the bright plane's freshly-mounted scroll animation to
  // wherever the always-mounted dim plane's identical animation already
  // is — without this, the two copies' text drifts out of horizontal
  // sync (dim mounted at page load, bright only mounts once waving
  // starts), so wherever the mask reveals bright text it visibly
  // doubles/blurs against the dim glyphs around it instead of lining up
  // with them.
  //
  // Previously this was estimated in JS (performance.now() at mount vs.
  // at sync time), which assumes the CSS animation actually starts
  // ticking at the same instant the component function runs — it
  // doesn't; there's a real gap between React committing and the browser
  // actually painting/starting the animation, and that gap grows under
  // main-thread contention. A cold page load (hydration, layout, fonts,
  // images all competing at once) is exactly when that gap is largest,
  // which is exactly when this was visibly off — a tab change, with the
  // rest of the app already warm, had far less contention and looked
  // fine. Reading the dim track's *actual* currentTime from the
  // browser's own animation clock via the Web Animations API sidesteps
  // the estimate entirely: it's exact regardless of how much jank
  // preceded it.
  useLayoutEffect(() => {
    if (!waving) return;
    const dimTrack = dimTrackRef.current;
    const brightPlane = brightPlaneRef.current;
    if (!dimTrack || !brightPlane) return;
    const dimAnim = dimTrack.getAnimations()[0];
    if (!dimAnim) return;
    const currentTime = dimAnim.currentTime;
    brightPlane
      .querySelectorAll<HTMLDivElement>(".watermark-row__track")
      .forEach((track) => {
        track.getAnimations().forEach((anim) => {
          anim.currentTime = currentTime;
        });
      });
  }, [waving]);

  // Two things measured off the same rendered copy: how many repetitions
  // are actually needed to outrun the viewport (so the loop never runs
  // out of real content), and the duration that makes every page slide
  // at the same constant pixels-per-second regardless of word length or
  // viewport width.
  useLayoutEffect(() => {
    const fieldEl = fieldRef.current;
    const copyEl = copyRef.current;
    if (!fieldEl || !copyEl) return;

    const sync = () => {
      const width = copyEl.getBoundingClientRect().width;
      if (width <= 0) return;

      // The rotated plane can expose more than the raw viewport size —
      // the larger of width/height, generously padded, comfortably
      // covers it without needing to duplicate the -18deg/150vmax CSS
      // details here.
      const target = Math.max(window.innerWidth, window.innerHeight) * 1.6;
      const perRepeat = width / repeats;
      const needed = Math.min(
        MAX_REPEATS,
        Math.max(MIN_REPEATS, Math.ceil(target / perRepeat))
      );
      if (needed !== repeats) {
        if (syncAttemptsRef.current >= 5) {
          // Not converging — stop adjusting and just go with whatever's
          // currently rendered rather than looping indefinitely.
          fieldEl.style.setProperty(
            "--watermark-duration",
            `${width / PIXELS_PER_SECOND}s`
          );
          return;
        }
        syncAttemptsRef.current += 1;
        setRepeats(needed);
        return; // the resulting re-render + resize triggers sync again
      }
      syncAttemptsRef.current = 0;

      fieldEl.style.setProperty(
        "--watermark-duration",
        `${width / PIXELS_PER_SECOND}s`
      );
    };

    sync();
    window.addEventListener("resize", sync);
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(copyEl);
    return () => {
      window.removeEventListener("resize", sync);
      resizeObserver.disconnect();
    };
  }, [text, repeats]);

  // Shared by both the real (dim) plane and the bright duplicate — the
  // exact same rows/repeats/track structure, so the two stay pixel-
  // aligned. attachRef is only ever true for the real plane's copy: a
  // ref can only ever point at one live DOM node, and the resize
  // measurement only needs one reference sample regardless of how many
  // copies of the markup exist.
  function renderRows(attachRef: boolean) {
    return Array.from({ length: ROWS }).map((_, row) => (
      <div
        key={row}
        className={`watermark-row${row % 2 === 1 ? " watermark-row--reverse" : ""}`}
      >
        <div
          className="watermark-row__track"
          ref={attachRef && row === 0 ? dimTrackRef : undefined}
        >
          {[0, 1].map((copy) => (
            <div
              className="watermark-row__copy"
              key={copy}
              ref={
                attachRef && row === 0 && copy === 0 ? copyRef : undefined
              }
            >
              {Array.from({ length: repeats }).map((_, i) => (
                <span key={i}>{text}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    ));
  }

  return (
    <div className="watermark-field" ref={fieldRef} aria-hidden="true">
      <div className="watermark-plane">{renderRows(true)}</div>
      {/* Same content, same position/rotation, in a bright accent color
          — see .watermark-plane--bright in globals.css for how the mask
          on this one turns it into a single traveling light band rather
          than a second static watermark. .watermark-bright-clip is a
          second, non-moving mask scoped to just this layer (not
          .watermark-field, which would also affect the always-visible
          dim watermark) — it's what fades the pulse out as it
          approaches the sidebar/content partition. Only ever mounted
          while waving, so there's zero extra cost the rest of the
          time. */}
      {waving && (
        <div className="watermark-bright-clip" aria-hidden="true">
          <div
            className="watermark-plane watermark-plane--bright"
            ref={brightPlaneRef}
            style={{
              maskImage: `url("${maskDataUriRef.current}")`,
              WebkitMaskImage: `url("${maskDataUriRef.current}")`,
            }}
          >
            {/* Phase-lock to the dim plane happens imperatively, in the
                useLayoutEffect above, once these tracks actually exist. */}
            {renderRows(false)}
          </div>
        </div>
      )}
    </div>
  );
}
