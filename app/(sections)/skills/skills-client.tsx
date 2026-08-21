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

export function SkillsPageClient() {
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

      {/* Same gap-x-4 the filter+sort rows on Projects/Certifications use
          for this exact "one compact control beside another" shape, so
          the spacing reads consistently across pages. Graph view's own
          icon-toggle + mode-toggle pairing keeps its own tighter gap-2 —
          those two are wider together, and gap-2 is what was tuned to
          keep them from wrapping onto two lines on a narrow phone. */}
      <div
        className={`mt-6 flex flex-wrap items-center justify-end md:flex-row md:justify-between ${
          view === "list" ? "gap-x-4 gap-y-3" : "gap-2"
        }`}
      >
        {/* order-2, not DOM order — on mobile this view-selector sits to
            the right of whichever mode/sort control is currently beside
            it, in both branches below; desktop keeps the natural
            (unreordered) DOM order it always had. */}
        <div className="order-2 flex items-center gap-1 rounded-lg border border-line bg-card-tint p-1 backdrop-blur-[6px] md:order-none">
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
            className="order-1 inline-flex items-center gap-1.5 text-xs font-medium text-accent-soft transition-colors hover:text-accent md:order-none"
          >
            {allOpen ? "Collapse all" : "Expand all"}
            <ChevronDownIcon
              className={`h-3.5 w-3.5 transition-transform ${allOpen ? "rotate-180" : ""}`}
            />
          </button>
        ) : (
          <div className="order-1 flex flex-wrap items-center justify-end gap-1 rounded-lg border border-line bg-card-tint p-1 backdrop-blur-[6px] md:order-none">
            {/* whitespace-nowrap on each button — without it, a container
                too narrow to fit both side by side wraps text awkwardly
                mid-button ("By" / "category" split across two lines
                inside the same pill) instead of the pair itself dropping
                to a second line as two clean, still-single-line
                buttons. flex-wrap on the container is what allows that
                clean drop; justify-end keeps the second one right-
                aligned under the first when it does. */}
            <button
              type="button"
              onClick={() => setGraphMode("category")}
              aria-pressed={graphMode === "category"}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
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
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
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
