"use client";

import { useState } from "react";
import type { SkillTag } from "@/lib/data/skills";

export function TechIcon({ skill }: { skill: SkillTag }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
    >
      <span
        role="tooltip"
        className={`absolute -top-8 whitespace-nowrap rounded-md bg-panel-alt px-2 py-1 text-[10px] font-semibold tracking-wide text-ink transition-opacity duration-150 ${
          hovered ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {skill.name.toUpperCase()}
      </span>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-panel-alt text-xs font-semibold text-accent-soft transition-colors duration-150 hover:border-accent/40 hover:text-accent">
        {skill.abbr}
      </div>
    </div>
  );
}
