"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Renders the eyebrow + big heading used at the top of every page. Pulls the
 * eyebrow up out of flow by its own measured height (rather than a guessed
 * constant) so the *heading* — not the eyebrow — lands at the very top of
 * PageShell's padding box. That keeps it aligned with the sidebar name,
 * which has no eyebrow of its own sitting above it.
 */
export function PageHeading({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  const eyebrowRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = eyebrowRef.current;
    if (!el) return;

    const sync = () => {
      const height = el.getBoundingClientRect().height;
      el.style.marginTop = `-${height + 8}px`;
    };

    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <>
      <p
        ref={eyebrowRef}
        className="text-xs font-medium uppercase tracking-widest text-ink-faint"
      >
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-[36px] font-bold leading-tight text-ink sm:text-[48px]">
        {children}
      </h2>
    </>
  );
}
