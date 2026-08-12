"use client";

import { useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { experiences, type ExperienceType } from "@/lib/data/experience";
import { ExperienceCard } from "./experience-card";

const FILTERS: { id: ExperienceType; label: string }[] = [
  { id: "full-time", label: "Full-Time" },
  { id: "internship", label: "Internships" },
  { id: "freelance", label: "Freelance" },
];

export default function ExperiencePage() {
  const [filter, setFilter] = useState<ExperienceType>("internship");
  const filtered = experiences.filter((e) => e.type === filter);

  return (
    <PageShell watermark="EXPERIENCE">
      <PageHeading eyebrow="Experience">Professional Experience</PageHeading>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = experiences.filter((e) => e.type === f.id).length;
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
              <sup className="text-[11px] font-semibold">{count}</sup>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex max-w-2xl flex-col gap-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-ink-faint">
            No entries in this category yet.
          </p>
        ) : (
          filtered.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))
        )}
      </div>
    </PageShell>
  );
}
