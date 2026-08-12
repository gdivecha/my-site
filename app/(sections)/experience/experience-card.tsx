"use client";

import { useState } from "react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Tag } from "@/components/Pill";
import { ChevronDownIcon } from "@/components/icons";
import type { Experience } from "@/lib/data/experience";

function QA({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-accent-soft">
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}

export function ExperienceCard({ experience }: { experience: Experience }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-line bg-transparent p-6 backdrop-blur-[3.8px] transition-colors hover:bg-panel-alt/20">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-semibold text-ink">
          {experience.role}
        </h3>
        <span className="shrink-0 text-xs text-ink-faint">
          {experience.dateRange}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-5">
        <ImagePlaceholder
          label={experience.company}
          className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
        />
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-medium sm:text-base"
            style={{ color: "#616297" }}
          >
            {experience.company}
            {experience.team ? `, ${experience.team}` : ""}
          </p>

          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {experience.summary}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {experience.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>

      {experience.details && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-accent-soft transition-colors hover:text-accent"
          aria-expanded={expanded}
        >
          {expanded ? "Hide details" : "View details"}
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {experience.details && expanded && (
        <div className="mt-6 space-y-5 border-t border-line pt-6">
          <QA
            label="What challenges did I face while working here?"
            text={experience.details.challenges}
          />
          <QA
            label="How did this role shape my career aspirations or personal goals?"
            text={experience.details.growth}
          />
        </div>
      )}
    </div>
  );
}
