"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { Tag } from "@/components/Pill";
import type { Recommendation } from "@/lib/data/recommendations";
import { RecommenderEntry } from "./recommender-entry";

export function RoleCard({
  role,
  term,
  recommendations,
}: {
  role: string;
  term: string;
  recommendations: Recommendation[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-line bg-panel p-6">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 text-left"
        aria-expanded={expanded}
      >
        <div>
          <h4 className="text-sm font-semibold text-ink">{role}</h4>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Tag>{term}</Tag>
            <span className="text-xs text-ink-faint">
              {recommendations.length}{" "}
              {recommendations.length === 1 ? "recommendation" : "recommendations"}
            </span>
          </div>
        </div>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="mt-5 flex flex-col gap-4">
          {recommendations.map((rec) => (
            <RecommenderEntry key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
