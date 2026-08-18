"use client";

import { useLayoutEffect, useRef } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { ENTRANCE_MS } from "@/lib/entrance-timing";

/** Reads a `translateY(...)` (or `matrix(...)`/`matrix3d(...)`) computed
 * transform's Y component, in px — 0 if there's no transform applied. */
function currentTranslateY(el: Element): number {
  const transform = getComputedStyle(el).transform;
  if (transform === "none") return 0;
  const matrix3d = transform.match(/^matrix3d\(([^)]+)\)$/);
  if (matrix3d) return parseFloat(matrix3d[1].split(",")[13]);
  const matrix2d = transform.match(/^matrix\(([^)]+)\)$/);
  if (matrix2d) return parseFloat(matrix2d[1].split(",")[5]);
  return 0;
}

/** A "there's more below" cue that's a genuine part of the page's own
 * flow (not fixed/portaled to the viewport) — it scrolls with
 * everything else, same as any other element here. Clicking it
 * scrolls the "Elsewhere on this site" section (the next thing after
 * the hero) into view.
 *
 * Vertically aligned with the sidebar's copyright line by measuring
 * its actual rendered position, not a guessed CSS offset — that
 * copyright is `fixed` inside the sidebar, while this button is a
 * normal, scrolling part of the page's own flow (the hero block's
 * height above it is only ever an estimate of "about one viewport"),
 * so no amount of matching padding/margin values between the two
 * guarantees they land on the same pixel.
 *
 * Two known races are compensated for directly (scroll position not
 * yet reset after a navigation, and PageShell's own entrance transform
 * resetting fresh on every mount while the persistent sidebar's
 * copyright stays settled) — but rather than betting everything on
 * enumerating every possible cause of a mid-transition measurement
 * being wrong, this re-measures every animation frame for a fixed
 * window after mount, instead of trusting a single snapshot.
 *
 * That window is ENTRANCE_MS (PageShell's own transition-duration) plus
 * a small buffer, not "however many frames until it looks stable" —
 * PageShell's transform uses an ease-out curve, so its *frame-to-frame*
 * delta shrinks to sub-pixel well before the transform has actually
 * finished settling to translate-y-0; a stability-based early-exit
 * would trigger on that small-delta tail and stop correcting before
 * the real end state is reached. Running for the animation's known
 * actual duration sidesteps that regardless of the easing curve's
 * shape. Per-frame corrections read as "settling into place," not a
 * snap — a visible jump only happens from one large correction long
 * after the fact, which is what earlier versions of this did wrong.
 * Writes directly to the DOM via the ref rather than React state,
 * since this runs on every animation frame for that whole window and
 * doesn't need a re-render for any of them. */
export function ScrollHint() {
  const ref = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const copyright = document.querySelector("[data-copyright]");
    const pageContent = el?.closest("[data-page-content]");
    if (!el || !copyright || !pageContent) return;

    let rafId: number;
    const start = performance.now();
    const windowMs = ENTRANCE_MS + 150;

    function align() {
      if (!el) return;
      const elRect = el.getBoundingClientRect();
      const copyrightRect = copyright!.getBoundingClientRect();
      const pageContentShiftY = currentTranslateY(pageContent!);
      // elRect already includes whatever transform THIS function itself
      // applied on the previous frame — without subtracting it back out
      // here too, each iteration computes its correction against an
      // already-corrected baseline instead of the button's true natural
      // position, turning this into a leaky feedback loop that converges
      // on a damped, wrong offset instead of the real one.
      const ownShiftY = currentTranslateY(el);

      const elDocTop =
        elRect.top + window.scrollY - pageContentShiftY - ownShiftY;
      const elCenter = elDocTop + elRect.height / 2;
      const copyrightCenter = copyrightRect.top + copyrightRect.height / 2;
      const offset = copyrightCenter - elCenter;

      el.style.transform = `translateY(${offset}px)`;

      if (performance.now() - start > windowMs) return;
      rafId = requestAnimationFrame(align);
    }

    align();
    return () => cancelAnimationFrame(rafId);
  }, []);

  function handleClick() {
    document
      .getElementById("elsewhere-on-this-site")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className="group inline-flex items-center gap-1.5 self-start text-xs font-medium text-ink-faint transition-colors hover:text-accent-soft"
    >
      See more below
      <ChevronDownIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
    </button>
  );
}
