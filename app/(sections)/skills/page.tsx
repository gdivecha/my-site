"use client";

import { useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { ChevronDownIcon } from "@/components/icons";
import { skillCategories } from "@/lib/data/skills";
import { SkillRow } from "./skill-row";

export default function SkillsPage() {
  // Content-creation categories are hidden for now — swap "engineering" for
  // "content" (or bring back the toggle) to show them again.
  const categories = skillCategories.filter((c) => c.group === "engineering");

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
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

      <button
        type="button"
        onClick={toggleAll}
        className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-accent-soft transition-colors hover:text-accent"
      >
        {allOpen ? "Collapse all" : "Expand all"}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform ${allOpen ? "rotate-180" : ""}`}
        />
      </button>

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
    </PageShell>
  );
}
