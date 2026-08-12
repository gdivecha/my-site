"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { projects, type ProjectCategory } from "@/lib/data/projects";
import { ProjectCard } from "./project-card";

const FILTERS: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "full-stack", label: "Full-Stack" },
  { id: "backend", label: "Back-end" },
  { id: "hackathon", label: "Hackathon" },
];

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <PageShell variant="projects" watermark="PROJECTS">
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
        Projects
      </p>
      <h2 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        My Work
      </h2>

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
                  ? "border-accent/50 bg-accent text-ink"
                  : "border-line bg-panel text-ink-faint hover:text-ink-soft"
              }`}
            >
              {f.label}
              <sup className="text-[10px] font-semibold">{count}</sup>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid max-w-4xl gap-6 sm:grid-cols-2">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </PageShell>
  );
}
