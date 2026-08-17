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
  if (waving) {
    if (brightSyncElapsedRef.current === null) {
      brightSyncElapsedRef.current = performance.now() - mountedAtRef.current;
    }
  } else {
    brightSyncElapsedRef.current = null;
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
          <div className="watermark-plane watermark-plane--bright">
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
