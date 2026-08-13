"use client";

import { useLayoutEffect, useRef } from "react";

const ROWS = 44;
const REPEATS_PER_COPY = 8;
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
