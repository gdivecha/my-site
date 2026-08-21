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
 * Vertically aligned with the sidebar's copyright line on desktop, or
 * (mobile) centered between the bio's "Read more" toggle and the fixed
 * dial nav's top edge, by measuring actual rendered positions rather
 * than a guessed CSS offset — the desktop copyright is `fixed` inside
 * the sidebar while this button scrolls with the page; the mobile dial
 * nav is a portal that doesn't even exist in the DOM at first mount.
 * Neither relationship survives being expressed as static CSS.
 *
 * Several known races are compensated for by re-deriving both the
 * *target* to align to and the alignment itself fresh on every
 * animation frame for a fixed window after mount, instead of computing
 * either once and trusting it: scroll position not yet reset after a
 * navigation, PageShell's own entrance transform resetting fresh on
 * every mount while the persistent sidebar's copyright stays settled,
 * and — the one that actually broke this in practice, confirmed via a
 * real measurement landing at the button's plain untransformed
 * position — the mobile dial nav's portal not existing yet on this
 * effect's first (synchronous, useLayoutEffect) pass, since it mounts
 * via its own plain useEffect in a later commit. Re-querying every
 * frame is what lets this recover once the portal actually shows up,
 * rather than betting everything on enumerating every possible cause of
 * a mid-transition measurement being wrong.
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
    if (!el) return;

    let rafId: number;
    const start = performance.now();
    // ENTRANCE_MS + 1000, not the original desktop-only "+ 150" — the
    // mobile dial nav's own portal (see DialNav.tsx) doesn't exist in
    // the DOM yet at this effect's very first run: it mounts via its
    // own plain useEffect (isCompact resolving), which lands in a LATER
    // commit than this useLayoutEffect's synchronous first pass — the
    // same mount-order race the skill graph's own frame-size
    // measurement hit earlier. Re-querying targets every frame (below),
    // not just once up front, is what actually recovers once the portal
    // shows up mid-loop; the longer window is what gives that enough
    // real time to happen before the loop gives up.
    const windowMs = ENTRANCE_MS + 1000;

    function align() {
      if (!el) return;

      const copyright = document.querySelector("[data-copyright]");
      // The sidebar's own copyright (what desktop aligns to) is md+
      // only — below md it's `display:none`, replaced by
      // SectionsLayout's own per-page copyright at the true bottom of
      // the page instead (see Sidebar.tsx). A hidden element's rect is
      // all zeros, which would otherwise pull this button up near the
      // top of the screen instead of leaving it at its own natural
      // position.
      const desktopTarget =
        copyright && getComputedStyle(copyright).display !== "none"
          ? copyright
          : null;
      const pageContent = el.closest("[data-page-content]");

      // Mobile: centers between the bio's "Read more" toggle and the
      // fixed dial nav's top edge instead — there's no copyright to
      // align to there (see above), and unlike desktop this button
      // isn't hidden on mobile at all, it just needs a different
      // anchor. Both candidate nav elements share the same
      // [data-dial-nav] attribute (the desktop rail and the mobile
      // portal bar) — filtering for a real rendered height picks
      // whichever one is actually visible at this width instead of the
      // other, CSS-hidden one (zero-rect, same failure mode as the
      // copyright check above) — or, before the mobile portal has
      // mounted at all yet, neither, which this frame just skips.
      const bioToggle = document.querySelector("[data-bio-toggle]");
      const dialNav = [...document.querySelectorAll("[data-dial-nav]")].find(
        (nav) => nav.getBoundingClientRect().height > 0
      );
      const mobileTarget =
        !desktopTarget && bioToggle && dialNav ? { bioToggle, dialNav } : null;

      // elRect already includes whatever transform THIS function itself
      // applied on the previous frame — without subtracting it back out
      // here too, each iteration computes its correction against an
      // already-corrected baseline instead of the button's true natural
      // position, turning this into a leaky feedback loop that converges
      // on a damped, wrong offset instead of the real one.
      const ownShiftY = currentTranslateY(el);
      const elRect = el.getBoundingClientRect();

      if (desktopTarget && pageContent) {
        const copyrightRect = desktopTarget.getBoundingClientRect();
        const pageContentShiftY = currentTranslateY(pageContent);
        const elDocTop =
          elRect.top + window.scrollY - pageContentShiftY - ownShiftY;
        const elCenter = elDocTop + elRect.height / 2;
        const copyrightCenter = copyrightRect.top + copyrightRect.height / 2;
        el.style.transform = `translateY(${copyrightCenter - elCenter}px)`;
      } else if (mobileTarget) {
        // Pure viewport-relative math, no document-coordinate
        // conversion needed — the toggle and this button share the same
        // (possibly still-transforming) page-content ancestor, so that
        // shared shift cancels out directly; the dial nav is `fixed`
        // (already viewport-relative, no ancestor transform to begin
        // with).
        const toggleRect = mobileTarget.bioToggle.getBoundingClientRect();
        const navRect = mobileTarget.dialNav.getBoundingClientRect();
        const naturalElCenter = elRect.top - ownShiftY + elRect.height / 2;
        const midpoint = (toggleRect.bottom + navRect.top) / 2;
        el.style.transform = `translateY(${midpoint - naturalElCenter}px)`;
      }
      // Neither target ready yet (e.g. mobile portal not mounted this
      // frame) — leave any prior transform as-is and just try again
      // next frame rather than snapping back to an untransformed 0.

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
      className="group inline-flex items-center gap-1.5 self-end text-xs font-medium text-ink-faint transition-colors hover:text-accent-soft md:self-start"
    >
      See more below
      <ChevronDownIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
    </button>
  );
}
