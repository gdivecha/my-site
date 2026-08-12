"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { skillCategories } from "@/lib/data/skills";
import { SkillRow } from "./skill-row";

const FILTERS = [
  { id: "engineering", label: "Software Engineering" },
  { id: "content", label: "Content Creation" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function SkillsPage() {
  const [filter, setFilter] = useState<FilterId>("engineering");
  const categories = skillCategories.filter((c) => c.group === filter);

  return (
    <PageShell variant="skills" watermark="SKILLS">
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
        Skills
      </p>
      <h2 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        My Expertise
      </h2>

      <div className="mt-8 inline-flex rounded-full border border-line bg-panel p-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
              filter === f.id
                ? "bg-accent text-ink"
                : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex max-w-2xl flex-col gap-3">
        {categories.map((category) => (
          <SkillRow key={category.id} category={category} />
        ))}
      </div>
    </PageShell>
  );
}
