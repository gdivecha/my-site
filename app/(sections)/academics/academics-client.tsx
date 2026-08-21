"use client";

import { useState } from "react";
import Image from "next/image";
import { FilterMenu } from "@/components/FilterMenu";
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

export function AcademicsPageClient() {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <PageShell watermark="ACADEMICS">
      <PageHeading eyebrow="Academics">Education</PageHeading>

      {/* Mobile: a dropdown (same FilterMenu component the Certifications/
          Projects filters use) instead of trying to fit three independent
          pills — that took several attempts (wrapping across two uneven
          lines, then a segmented control whose equal-width cells let
          "Achievements" overflow into its neighbor on a narrow screen,
          then ellipsis-truncated labels that just looked bad a different
          way) and each was still fundamentally fighting the same
          constraint: three labels of very different lengths sharing one
          row. A dropdown sidesteps that entirely — only the ACTIVE tab's
          label needs to fit on the closed button, and the open menu can
          size each option on its own line with no shared-row constraint
          at all. Desktop is untouched (the original independent-pill
          row, hidden on mobile via md:flex). */}
      <div className="mt-8 flex flex-wrap items-center justify-end gap-2 md:justify-start">
        <FilterMenu options={TABS} activeId={tab} onSelect={setTab} label="Switch tab" />
        <div className="hidden flex-wrap gap-2 md:flex">
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
                    : "filter-pill border-line bg-panel text-ink-faint hover:text-ink-soft"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={tab}
        className="mt-8 max-w-2xl [animation:tab-panel-in_0.5s_ease-out] motion-reduce:[animation:none]"
      >
        {tab === "overview" && (
          <div className="rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[6px] md:p-8">
            {/* flex-col on mobile, not the row layout desktop uses —
                squeezing the logo beside the text there left only a
                narrow column for the school name/degree, wrapping into
                many awkward short lines (same problem, same fix as
                experience-card.tsx). Stacking gives that text the card's
                full width; self-end (only the logo needs it) keeps it
                right-anchored above the text, matching the page's usual
                mobile media placement. Desktop is untouched (md:flex-row). */}
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-5">
              <div className="relative h-24 w-24 shrink-0 self-end overflow-hidden rounded-xl border border-line bg-white sm:h-28 sm:w-28 md:self-auto">
                <Image
                  src={education.logoSrc}
                  alt={`${education.school} logo`}
                  fill
                  sizes="112px"
                  // Tiny local file — see experience-card.tsx/
                  // issuer-badge.tsx for why these load eagerly rather
                  // than lazily.
                  loading="eager"
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

                <div className="mt-3 flex flex-wrap justify-end gap-2 md:justify-start">
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
                  <h4 className="flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-widest text-ink-faint md:justify-start">
                    {/* order-2: the icon sits after (to the right of) the
                        label on mobile — desktop keeps the original
                        icon-first order. */}
                    <span className="order-2 md:order-none" aria-hidden="true">
                      {cat.icon}
                    </span>
                    {cat.label}
                  </h4>
                  {/* [direction:rtl] flips which corner CSS Grid's
                      auto-placement treats as "start" — the first course
                      lands top-right and each one after it fills leftward
                      (wrapping to the next row the same way), rather than
                      the default top-left-then-rightward fill. Reset back
                      to ltr on both desktop (unchanged fill order there)
                      and inside every card itself (CourseCard sets its
                      own [direction:ltr] unconditionally) — without that
                      second reset, rtl here would also flip each card's
                      own internal content, not just the grid's fill
                      order. */}
                  <div className="mt-3 grid grid-cols-2 items-start gap-4 [direction:rtl] sm:grid-cols-3 md:[direction:ltr]">
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
                className="flex items-start gap-4 rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]"
              >
                {/* order-2/order-1: icon on the right, text on the left,
                    on mobile — matching the page's usual mobile
                    right-anchored-media convention. Desktop keeps the
                    original (unreordered) DOM order. */}
                <span
                  className="order-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tag-bg text-lg md:order-none"
                  aria-hidden="true"
                >
                  {achievement.icon}
                </span>
                <div className="order-1 min-w-0 flex-1 text-right md:order-none md:flex-initial md:text-left">
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
