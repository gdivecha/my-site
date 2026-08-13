"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Tag } from "@/components/Pill";
import { ChevronDownIcon } from "@/components/icons";
import type { Experience } from "@/lib/data/experience";

// Always computed, never hardcoded — end defaults to today for ongoing
// roles (no endDate set). +1 makes it inclusive of both start and end
// months, matching how e.g. "Jun - Aug" reads as 3 months, not 2.
function durationText(experience: Experience): string {
  const start = new Date(experience.startDate);
  const end = experience.endDate ? new Date(experience.endDate) : new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;
  const n = Math.max(months, 1);
  return `${n} ${n === 1 ? "month" : "months"}`;
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
  const duration = durationText(experience);

  return (
    <div className="rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[3.8px] transition-colors hover:bg-card-tint-hover">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-semibold text-ink">
          {experience.role}
        </h3>
        <span className="shrink-0 text-xs text-ink-faint">
          {experience.dateRange}
          {duration ? ` · ${duration}` : ""}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-5">
        {experience.logoSrc ? (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line sm:h-28 sm:w-28">
            <Image
              src={experience.logoSrc}
              alt={`${experience.company} logo`}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
        ) : (
          <ImagePlaceholder
            label={experience.company}
            className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
          />
        )}
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-medium sm:text-base"
            style={{ color: "#616297" }}
          >
            {experience.company}
            {experience.team ? `, ${experience.team}` : ""}
          </p>

          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {experience.summary.join(" ")}
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
