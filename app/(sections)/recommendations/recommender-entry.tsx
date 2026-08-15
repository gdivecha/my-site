"use client";

import { useState } from "react";
import { ChevronDownIcon, LinkedinIcon } from "@/components/icons";
import type { Recommendation } from "@/lib/data/recommendations";

export function RecommenderEntry({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-line pt-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">
            {recommendation.recommenderName}
          </span>
          {recommendation.linkedin && (
            <a
              href={recommendation.linkedin === "#" ? undefined : recommendation.linkedin}
              target={recommendation.linkedin === "#" ? undefined : "_blank"}
              rel="noreferrer"
              aria-label={`${recommendation.recommenderName} on LinkedIn`}
              className="text-ink-faint transition-colors hover:text-accent-soft"
            >
              <LinkedinIcon className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <span className="text-xs text-ink-faint">
          {recommendation.recommenderTitle} · {recommendation.relationship}
        </span>
      </div>
      <p
        className={`mt-2 text-sm leading-relaxed text-ink-soft ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        &ldquo;{recommendation.quote}&rdquo;
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent-soft hover:text-accent"
      >
        {expanded ? "See less" : "See more"}
        <ChevronDownIcon
          className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
