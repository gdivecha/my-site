"use client";

import { useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { education } from "@/lib/data/education";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "coursework", label: "Coursework" },
  { id: "achievements", label: "Achievements" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AcademicsPage() {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <PageShell watermark="ACADEMICS">
      <PageHeading eyebrow="Academics">Education</PageHeading>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
                active
                  ? "border-accent/50 bg-accent text-white"
                  : "border-line bg-panel text-ink-faint hover:text-ink-soft"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 max-w-2xl">
        {tab === "overview" && (
          <div className="rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[3.8px] md:p-8">
            <h3 className="text-lg font-semibold text-ink">
              {education.school}
            </h3>
            <p className="mt-1 text-sm text-accent-soft">{education.degree}</p>
            <p className="mt-3 text-xs text-ink-faint">
              {education.dateRange}
            </p>
            <p className="text-xs text-ink-faint">{education.location}</p>
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">
              {education.overview}
            </p>
          </div>
        )}

        {tab === "coursework" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {education.coursework.map((course) => (
              <div
                key={course.title}
                className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-card-tint p-5 text-center backdrop-blur-[3.8px]"
              >
                <span className="text-2xl" aria-hidden="true">
                  {course.icon}
                </span>
                <span className="text-sm font-medium text-ink">
                  {course.title}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "achievements" && (
          <div className="flex flex-col gap-4">
            {education.achievements.map((achievement) => (
              <div
                key={achievement.title}
                className="flex items-start gap-4 rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[3.8px]"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tag-bg text-lg"
                  aria-hidden="true"
                >
                  {achievement.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {achievement.title}
                  </p>
                  {achievement.description && (
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {achievement.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
