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

      // The *first* line's bottom is what should land on sidebarBottom,
      // not the bottom of the whole heading box — those are the same
      // thing for every title that fits on one line (true everywhere
      // else on the site), but a title long enough to wrap (e.g.
      // StraySAFE's) has a taller box, and using its full height here
      // would push the first line a whole line-height too high to make
      // the *second* line's bottom hit the target instead. Computed
      // line-height already resolves to a px value even though the
      // class below sets it as a unitless multiplier.
      const lineHeightRaw = parseFloat(
        getComputedStyle(headingEl).lineHeight
      );
      // Falls back to the full box height (the old behavior) on the off
      // chance line-height ever resolves to "normal" instead of a px
      // value — still correct for the common single-line case, just not
      // for a wrapped title.
      const lineHeight = Number.isNaN(lineHeightRaw)
        ? headingEl.getBoundingClientRect().height
        : lineHeightRaw;
      const top = sidebarBottom - lineHeight;
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
      <h1
        ref={headingRef}
        className="mt-2 font-display text-[30px] font-bold leading-tight text-ink sm:text-[48px]"
      >
        {children}
      </h1>
    </>
  );
}
