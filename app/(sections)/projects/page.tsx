"use client";

import { useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { projects, type ProjectCategory } from "@/lib/data/projects";
import { ProjectCard } from "./project-card";

const FILTERS: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "full-stack", label: "Full-Stack" },
  { id: "backend", label: "Back-end" },
  { id: "hardware", label: "Hardware" },
];

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <PageShell watermark="PROJECTS">
      <PageHeading eyebrow="Projects">My Work</PageHeading>

      <div className="mt-8 flex flex-wrap gap-2">
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
                  : "border-line bg-panel text-ink-faint hover:text-ink-soft"
              }`}
            >
              {f.label}
              <sup className="text-[11px] font-semibold">{count}</sup>
            </button>
          );
        })}
      </div>

      <div
        key={filter}
        className="mt-8 grid max-w-4xl gap-6 [animation:tab-panel-in_0.5s_ease-out] motion-reduce:[animation:none] sm:grid-cols-2"
      >
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </PageShell>
  );
}
