"use client";

import { useState } from "react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Tag } from "@/components/Pill";
import { ChevronDownIcon } from "@/components/icons";
import type { Experience } from "@/lib/data/experience";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
    <div className="rounded-2xl border border-line bg-panel p-6 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-panel-alt text-sm font-semibold text-accent-soft">
          {initials(experience.company)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-base font-semibold text-ink">
              {experience.role}
            </h3>
            <span className="shrink-0 text-xs text-ink-faint">
              {experience.dateRange}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">
            {experience.company}
            {experience.team ? ` · ${experience.team}` : ""}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {experience.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
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
            <div className="mt-6 grid gap-6 border-t border-line pt-6 md:grid-cols-[1fr_180px]">
              <div className="space-y-5">
                <QA
                  label="What did I work on?"
                  text={experience.details.workedOn}
                />
                <QA
                  label="What challenges did I face while working here?"
                  text={experience.details.challenges}
                />
                <QA
                  label="How did this role shape my career aspirations or personal goals?"
                  text={experience.details.growth}
                />
              </div>
              <ImagePlaceholder
                label={experience.company}
                className="aspect-square"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
