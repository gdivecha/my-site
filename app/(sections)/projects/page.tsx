"use client";

import { useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { SwapIcon } from "@/components/icons";
import { projects, type Project, type ProjectCategory } from "@/lib/data/projects";
import { ProjectCard } from "./project-card";

const FILTERS: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "full-stack", label: "Full-Stack" },
  { id: "backend", label: "Back-end" },
  { id: "hardware", label: "Hardware" },
];

type SortMode = "scale" | "newest" | "az" | "category";

// Cycled through by the sort button below, in this order — click steps
// to the next one and wraps back to "scale". "scale" is also the
// default on load, so the biggest/most involved projects lead.
const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "scale", label: "By scale" },
  { id: "newest", label: "Newest first" },
  { id: "az", label: "A-Z" },
  { id: "category", label: "By category" },
];

// Index in the original (chronological) array — used by "newest" so that
// sort doesn't need its own separate date field to fall back on.
const ORIGINAL_INDEX = new Map(projects.map((p, i) => [p.id, i]));

function sortProjects(list: Project[], sort: SortMode): Project[] {
  const sorted = [...list];
  if (sort === "az") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "category") {
    sorted.sort(
      (a, b) =>
        a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
  } else if (sort === "newest") {
    sorted.sort(
      (a, b) => ORIGINAL_INDEX.get(a.id)! - ORIGINAL_INDEX.get(b.id)!
    );
  } else {
    sorted.sort((a, b) => b.scale - a.scale);
  }
  return sorted;
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const [sort, setSort] = useState<SortMode>("scale");
  const sortLabel = SORT_OPTIONS.find((o) => o.id === sort)!.label;

  function cycleSort() {
    setSort((prev) => {
      const index = SORT_OPTIONS.findIndex((o) => o.id === prev);
      return SORT_OPTIONS[(index + 1) % SORT_OPTIONS.length].id;
    });
  }

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const sorted = sortProjects(filtered, sort);

  return (
    <PageShell watermark="PROJECTS">
      <PageHeading eyebrow="Projects">My Work</PageHeading>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.id === "all"
                ? projects.length
                : projects.filter((p) => p.category === f.id).length;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
                  active
                    ? "border-accent/50 bg-accent text-white"
                    : "filter-pill border-line bg-panel text-ink-faint hover:text-ink-soft"
                }`}
              >
                {f.label}
                <sup className="text-[11px] font-semibold">{count}</sup>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={cycleSort}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-accent-soft transition-colors hover:text-accent"
        >
          <SwapIcon className="h-3.5 w-3.5 rotate-90" aria-hidden="true" />
          {sortLabel}
        </button>
      </div>

      <div
        key={`${filter}-${sort}`}
        className="mt-8 grid max-w-4xl gap-6 [animation:tab-panel-in_0.5s_ease-out] motion-reduce:[animation:none] sm:grid-cols-2"
      >
        {sorted.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </PageShell>
  );
}
