"use client";

import { useState } from "react";
import Image from "next/image";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { Tag } from "@/components/Pill";
import { courseCategories, education } from "@/lib/data/education";
import { CourseCard } from "./course-card";

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

      <div
        key={tab}
        className="mt-8 max-w-2xl [animation:tab-panel-in_0.5s_ease-out] motion-reduce:[animation:none]"
      >
        {tab === "overview" && (
          <div className="rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[3.8px] md:p-8">
            <div className="flex items-start gap-5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-white sm:h-28 sm:w-28">
                <Image
                  src={education.logoSrc}
                  alt={`${education.school} logo`}
                  fill
                  sizes="112px"
                  className="object-contain p-3"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-ink">
                  {education.school}
                </h3>
                <p className="mt-1 text-sm text-accent-soft">
                  {education.degree}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Tag>{education.dateRange}</Tag>
                  <Tag>{education.location}</Tag>
                </div>
              </div>
            </div>

            <p className="mt-6 border-t border-line pt-6 text-sm leading-relaxed text-ink-soft">
              {education.overview}
            </p>
          </div>
        )}

        {tab === "coursework" && (
          <div className="flex flex-col gap-8">
            {courseCategories.map((cat) => {
              const courses = education.coursework.filter(
                (c) => c.category === cat.id
              );
              if (courses.length === 0) return null;
              return (
                <div key={cat.id}>
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">
                    <span aria-hidden="true">{cat.icon}</span>
                    {cat.label}
                  </h4>
                  <div className="mt-3 grid grid-cols-2 items-start gap-4 sm:grid-cols-3">
                    {courses.map((course) => (
                      <CourseCard key={course.title} course={course} />
                    ))}
                  </div>
                </div>
              );
            })}
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
