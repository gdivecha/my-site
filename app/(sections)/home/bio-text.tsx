"use client";

import { useState } from "react";

/** Home's bio paragraphs — full and unclamped on sm+ (the original
 * behavior), but collapsed to just the first paragraph's first few lines
 * on mobile, with a "Read more" toggle. line-clamp only works reliably on
 * a single block of text, not across several sibling <p> elements, so
 * paragraphs 2+ are hidden outright rather than folded into the clamp —
 * only the first paragraph is itself clamped. The fade overlay (not the
 * native line-clamp ellipsis) is what actually signals "there's more" —
 * confirmed empirically that Tailwind's line-clamp here computes
 * text-overflow:clip, not ellipsis, so the text was just cutting off
 * mid-word with no visual cue at all that anything was hidden. */
export function BioText({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{ gridArea: "bio" }}
      className="space-y-3 text-sm leading-relaxed text-ink-soft md:text-[15px] md:text-left"
    >
      {paragraphs.map((paragraph, i) =>
        i === 0 ? (
          // Always rendered (never hidden) — sm+ never clamps this
          // paragraph regardless of `expanded`, so hiding the wrapper
          // there (even conditionally) risked it never showing at all.
          <div key={i} className="relative">
            <p
              className={
                !expanded ? "line-clamp-4 sm:line-clamp-none" : undefined
              }
            >
              {paragraph}
            </p>
            {!expanded && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[var(--color-base)] to-transparent sm:hidden"
              />
            )}
          </div>
        ) : (
          <p key={i} className={!expanded ? "hidden sm:block" : undefined}>
            {paragraph}
          </p>
        )
      )}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        // data-bio-toggle: lets ScrollHint (a sibling, not a descendant)
        // measure this button's position to center itself between it
        // and the mobile dial nav's top edge — see scroll-hint.tsx.
        data-bio-toggle
        className="text-xs font-medium text-accent-soft transition-colors hover:text-accent-deep sm:hidden"
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </div>
  );
}
