"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Renders the eyebrow + big heading used at the top of every page. Pulls the
 * eyebrow up out of flow by its own measured height (rather than a guessed
 * constant) so the *heading* — not the eyebrow — lands at the top of
 * PageShell's padding box. Then, since the heading's own height differs from
 * the sidebar name's (different font sizes per breakpoint), it also reads
 * `--sidebar-title-bottom` (published by Sidebar) and its own measured
 * height to set `--sidebar-title-top` such that the heading's *bottom* edge
 * lines up with the name's bottom edge, not just the tops.
 */
export function PageHeading({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const eyebrowEl = eyebrowRef.current;
    const headingEl = headingRef.current;
    if (!eyebrowEl || !headingEl) return;

    const sync = () => {
      const eyebrowHeight = eyebrowEl.getBoundingClientRect().height;
      eyebrowEl.style.marginTop = `-${eyebrowHeight + 8}px`;

      const sidebarBottomRaw = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--sidebar-title-bottom");
      const sidebarBottom = parseFloat(sidebarBottomRaw);
      if (Number.isNaN(sidebarBottom)) {
        document.documentElement.style.removeProperty("--sidebar-title-top");
        return;
      }

      const headingHeight = headingEl.getBoundingClientRect().height;
      const top = sidebarBottom - headingHeight;
      document.documentElement.style.setProperty(
        "--sidebar-title-top",
        `${top}px`
      );
    };

    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <>
      <p
        ref={eyebrowRef}
        aria-hidden="true"
        className="text-xs font-medium uppercase tracking-widest text-ink-faint opacity-0"
      >
        {eyebrow}
      </p>
      <h2
        ref={headingRef}
        className="mt-2 font-display text-[36px] font-bold leading-tight text-ink sm:text-[48px]"
      >
        {children}
      </h2>
    </>
  );
}
