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

/** Builds a wavy vertical band as an inline SVG (a filled path, blurred
 * for a soft edge — same idea as the plain CSS gradient's transparent-
 * to-opaque-to-transparent ramp this replaces, just no longer a
 * straight-edged shape), encoded as a data URI so it can be dropped
 * straight into mask-image and animated with the same mask-position
 * sweep the rest of the shimmer already uses.
 *
 * Both edges get their own independently-random amplitude, frequency,
 * and phase — not the same wave mirrored on both sides, which would
 * only ever produce a constant-width wavy *ribbon*. Independent edges
 * let the band's width itself vary unevenly along its length each
 * time, which is what actually makes every session's proportions look
 * different rather than just its position along one repeating curve. */
function buildWavyMaskDataUri(): string {
  const height = 100;
  const steps = 48;
  const centerX = 50;
  // Narrower band — a slim streak passing through rather than a wide
  // swath covering a third of the screen at once. Deliberately NOT
  // touched to fix this: mask-size/mask-position in globals.css (those
  // control the sweep's travel distance and direction, already tuned and
  // easy to re-break) — only how much of that traveled width is actually
  // opaque.
  const halfWidth = 3;

  function edgeX(i: number, amplitude: number, frequency: number, phase: number) {
    const y = (i / steps) * height;
    return centerX + Math.sin((y / height) * Math.PI * 2 * frequency + phase) * amplitude;
  }

  const ampLeft = 1 + Math.random() * 2.5;
  const freqLeft = 1.5 + Math.random() * 3.5;
  const phaseLeft = Math.random() * Math.PI * 2;
  const ampRight = 1 + Math.random() * 2.5;
  const freqRight = 1.5 + Math.random() * 3.5;
  const phaseRight = Math.random() * Math.PI * 2;

  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * height;
    left.push(`${(edgeX(i, ampLeft, freqLeft, phaseLeft) - halfWidth).toFixed(2)},${y.toFixed(2)}`);
    right.push(`${(edgeX(i, ampRight, freqRight, phaseRight) + halfWidth).toFixed(2)},${y.toFixed(2)}`);
  }
  const d = `M ${left.join(" L ")} L ${right.reverse().join(" L ")} Z`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<filter id="b"><feGaussianBlur stdDeviation="1.4" /></filter>` +
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
  const [repeats, setRepeats] = useState(INITIAL_REPEATS);
  // When this component first mounts — i.e. the moment the dim plane's own
  // rows start their scroll animation — so the bright plane (mounted much
  // later, only once waving starts) can work out how far into that same
  // animation the dim plane already is.
  const mountedAtRef = useRef(performance.now());
  // How far into the shared scroll cycle the dim plane already was at the
  // instant the bright plane mounts — captured once per waving session
  // (not recomputed on every re-render while it's true, which would jump
  // the position each time), reset back to null once waving ends so the
  // next time it starts, this is captured fresh again.
  const brightSyncElapsedRef = useRef<number | null>(null);
  // This session's wavy mask shape — generated fresh each time waving
  // starts (same one-shot-per-session capture as brightSyncElapsedRef
  // above, reset to null once waving ends), not re-rolled on every
  // re-render while it's true.
  const maskDataUriRef = useRef<string | null>(null);
  if (waving) {
    if (brightSyncElapsedRef.current === null) {
      brightSyncElapsedRef.current = performance.now() - mountedAtRef.current;
    }
    if (maskDataUriRef.current === null) {
      maskDataUriRef.current = buildWavyMaskDataUri();
    }
  } else {
    brightSyncElapsedRef.current = null;
    maskDataUriRef.current = null;
  }

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
        setRepeats(needed);
        return; // the resulting re-render + resize triggers sync again
      }

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
  function renderRows(attachRef: boolean, trackStyle?: React.CSSProperties) {
    return Array.from({ length: ROWS }).map((_, row) => (
      <div
        key={row}
        className={`watermark-row${row % 2 === 1 ? " watermark-row--reverse" : ""}`}
      >
        <div className="watermark-row__track" style={trackStyle}>
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
            style={{
              maskImage: `url("${maskDataUriRef.current}")`,
              WebkitMaskImage: `url("${maskDataUriRef.current}")`,
            }}
          >
            {/* Phase-locks this freshly-mounted copy's own scroll animation
                to wherever the always-mounted dim copy's identical
                animation already is — without this, the two copies' text
                drifts out of horizontal sync (dim mounted at page load,
                this one only mounts once waving starts), so wherever the
                mask reveals bright text it visibly doubles/ghosts against
                the dim glyphs around it instead of lining up with them. */}
            {renderRows(false, {
              animationDelay: `-${brightSyncElapsedRef.current ?? 0}ms`,
            })}
          </div>
        </div>
      )}
    </div>
  );
}
