"use client";

import { useState } from "react";
import { SwapIcon } from "@/components/icons";
import type { Course } from "@/lib/data/education";

export function CourseCard({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-pressed={open}
      className="group flex h-36 w-full flex-col items-start gap-2 overflow-hidden rounded-2xl border border-line bg-card-tint p-4 text-left backdrop-blur-[6px] transition-colors duration-300 ease-out hover:border-accent/40 hover:bg-card-tint-hover"
    >
      <div className="flex w-full items-start justify-between">
        <span className="text-2xl" aria-hidden="true">
          {course.icon}
        </span>
        <SwapIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint opacity-0 transition-all duration-150 group-hover:text-accent-soft group-hover:opacity-100" />
      </div>

      {/* Fixed card height means every card is the same size regardless
          of content; overflow-hidden is a safety net in case a very long
          description would otherwise push past that fixed height. */}
      <div className="relative w-full flex-1">
        <span
          className={`absolute inset-0 text-sm font-medium text-ink transition-all duration-300 ease-out ${
            open ? "-translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {course.title}
        </span>

        <p
          className={`absolute inset-0 text-xs leading-relaxed text-ink-soft transition-all duration-300 ease-out ${
            open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {course.description}
        </p>
      </div>
    </button>
  );
}
