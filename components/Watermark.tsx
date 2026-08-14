"use client";

import { useLayoutEffect, useRef } from "react";

const ROWS = 44;
// Each row scrolls two back-to-back copies of this many repetitions and
// loops by jumping from translateX(-50%) back to 0 — seamless only if a
// single copy is already wider than the row's full visible span (150vmax
// of it, before the -18deg rotation makes it wider still). 8 was tuned
// against longer watermark words; a short one like "SKILLS" repeated 8
// times doesn't reach that width on a wide viewport, so the scroll runs
// past the last real repetition into genuinely empty track before it
// wraps — a real, periodic gap once per loop, not a one-off glitch. 30
// comfortably covers the shortest realistic word on the widest realistic
// screen regardless of which page's watermark text this is.
const REPEATS_PER_COPY = 30;
const PIXELS_PER_SECOND = 9;

export function Watermark({ text }: { text: string }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  // A row's animation-duration is derived from its own rendered width so
  // every page — regardless of word length or viewport — slides at the
  // same constant pixels-per-second speed rather than the same duration.
  useLayoutEffect(() => {
    const fieldEl = fieldRef.current;
    const copyEl = copyRef.current;
    if (!fieldEl || !copyEl) return;

    const sync = () => {
      const width = copyEl.getBoundingClientRect().width;
      if (width <= 0) return;
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
  }, [text]);

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
                  {Array.from({ length: REPEATS_PER_COPY }).map((_, i) => (
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
