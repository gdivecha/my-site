"use client";

import { useState } from "react";
import { TechIcon } from "@/components/TechIcon";
import type { SkillCategory } from "@/lib/data/skills";

export function SkillRow({ category }: { category: SkillCategory }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl border border-line bg-panel px-6 py-4 transition-colors hover:bg-panel-alt/60"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel-alt text-xs font-semibold text-accent-soft">
          {category.label.charAt(0)}
        </span>
        <span className="text-sm font-medium text-ink">{category.label}</span>
        <span className="ml-auto text-xs text-ink-faint">
          {category.skills.length}
        </span>
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          hovered ? "mt-4 grid-rows-[1fr]" : "mt-0 grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-4 pb-1 pt-1">
            {category.skills.map((skill) => (
              <TechIcon key={skill.name} skill={skill} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
