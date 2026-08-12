"use client";

import { useState } from "react";
import { TechIcon } from "@/components/TechIcon";
import {
  CloudIcon,
  CodeBracketsIcon,
  DatabaseIcon,
  FilmStripIcon,
  FlaskIcon,
  GlobeIcon,
  PaintbrushIcon,
  ShareNetworkIcon,
  SlidersIcon,
  SparkleIcon,
  WrenchIcon,
} from "@/components/icons";
import type { SkillCategory } from "@/lib/data/skills";

const categoryIcons: Record<string, typeof CodeBracketsIcon> = {
  languages: CodeBracketsIcon,
  backend: SlidersIcon,
  frontend: GlobeIcon,
  database: DatabaseIcon,
  cloud: CloudIcon,
  "ai-ml": SparkleIcon,
  testing: FlaskIcon,
  "other-tools": WrenchIcon,
  "video-editing": FilmStripIcon,
  "graphic-design": PaintbrushIcon,
  "social-media": ShareNetworkIcon,
};

export function SkillRow({ category }: { category: SkillCategory }) {
  const [open, setOpen] = useState(false);
  const CategoryIcon = categoryIcons[category.id] ?? CodeBracketsIcon;

  return (
    <div className="rounded-2xl border border-line bg-transparent backdrop-blur-[3.8px] transition-colors hover:bg-panel-alt/20">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-6 py-4 text-left"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel-alt text-accent-soft">
          <CategoryIcon className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium text-ink">{category.label}</span>
        <span className="ml-auto text-xs text-ink-faint">
          {category.skills.length}
        </span>
      </button>
      <div
        className={`grid px-6 transition-[grid-template-rows] duration-300 ease-out ${
          open ? "mt-0 grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"
        }`}
      >
        <div className={open ? "overflow-visible" : "overflow-hidden"}>
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
