"use client";

import { useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import {
  ChevronDownIcon,
  ShareNetworkIcon,
  StackedRowsIcon,
} from "@/components/icons";
import { skillCategories } from "@/lib/data/skills";
import { SkillConnectionGraph } from "./skill-connection-graph";
import { SkillGraph } from "./skill-graph";
import { SkillRow } from "./skill-row";

type ViewMode = "list" | "graph";
type GraphMode = "category" | "connections";

// Module scope, not inside the component — skillCategories is static, so
// this only needs to run once at import rather than once per render.
// SkillGraph/SkillConnectionGraph key their (expensive) layout useMemo on
// this array's identity, so a stable reference matters here, not just as
// a micro-optimization: computing it fresh in the component body would
// silently defeat that memoization on every render.
// Content-creation categories are hidden for now — swap "engineering" for
// "content" (or bring back the toggle) to show them again.
const categories = skillCategories.filter((c) => c.group === "engineering");

export default function SkillsPage() {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<ViewMode>("graph");
  const [graphMode, setGraphMode] = useState<GraphMode>("category");
  const allOpen = openIds.size === categories.length;

  function toggleAll() {
    setOpenIds(allOpen ? new Set() : new Set(categories.map((c) => c.id)));
  }

  function toggleOne(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <PageShell watermark="SKILLS">
      <PageHeading eyebrow="Skills">My Expertise</PageHeading>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-line bg-card-tint p-1 backdrop-blur-[3.8px]">
          <button
            type="button"
            onClick={() => setView("graph")}
            aria-label="Graph view"
            aria-pressed={view === "graph"}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              view === "graph"
                ? "bg-accent text-[var(--color-base)]"
                : "text-ink-faint hover:text-ink"
            }`}
          >
            <ShareNetworkIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              view === "list"
                ? "bg-accent text-[var(--color-base)]"
                : "text-ink-faint hover:text-ink"
            }`}
          >
            <StackedRowsIcon className="h-4 w-4" />
          </button>
        </div>

        {view === "list" ? (
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-soft transition-colors hover:text-accent"
          >
            {allOpen ? "Collapse all" : "Expand all"}
            <ChevronDownIcon
              className={`h-3.5 w-3.5 transition-transform ${allOpen ? "rotate-180" : ""}`}
            />
          </button>
        ) : (
          <div className="flex items-center gap-1 rounded-lg border border-line bg-card-tint p-1 backdrop-blur-[3.8px]">
            <button
              type="button"
              onClick={() => setGraphMode("category")}
              aria-pressed={graphMode === "category"}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                graphMode === "category"
                  ? "bg-accent text-[var(--color-base)]"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              By category
            </button>
            <button
              type="button"
              onClick={() => setGraphMode("connections")}
              aria-pressed={graphMode === "connections"}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                graphMode === "connections"
                  ? "bg-accent text-[var(--color-base)]"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              By connection
            </button>
          </div>
        )}
      </div>

      {view === "list" ? (
        <div className="mt-4 flex max-w-2xl flex-col gap-3">
          {categories.map((category) => (
            <SkillRow
              key={category.id}
              category={category}
              open={openIds.has(category.id)}
              onToggle={() => toggleOne(category.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          {graphMode === "category" ? (
            <SkillGraph categories={categories} />
          ) : (
            <SkillConnectionGraph categories={categories} />
          )}
        </div>
      )}
    </PageShell>
  );
}
