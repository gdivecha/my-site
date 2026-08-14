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
import { SkillGraph } from "./skill-graph";
import { SkillRow } from "./skill-row";

type ViewMode = "list" | "graph";

export default function SkillsPage() {
  // Content-creation categories are hidden for now — swap "engineering" for
  // "content" (or bring back the toggle) to show them again.
  const categories = skillCategories.filter((c) => c.group === "engineering");

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<ViewMode>("graph");
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
          <span />
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
          <SkillGraph categories={categories} />
        </div>
      )}
    </PageShell>
  );
}
