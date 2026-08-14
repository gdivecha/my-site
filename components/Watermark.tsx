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

export function Watermark({ text }: { text: string }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [repeats, setRepeats] = useState(INITIAL_REPEATS);

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

  return (
    <div className="watermark-field" ref={fieldRef} aria-hidden="true">
      <div className="watermark-plane">
        {Array.from({ length: ROWS }).map((_, row) => (
          <div
            key={row}
            className={`watermark-row${row % 2 === 1 ? " watermark-row--reverse" : ""}`}
          >
            <div className="watermark-row__track">
              {[0, 1].map((copy) => (
                <div
                  className="watermark-row__copy"
                  key={copy}
                  ref={row === 0 && copy === 0 ? copyRef : undefined}
                >
                  {Array.from({ length: repeats }).map((_, i) => (
                    <span key={i}>{text}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
