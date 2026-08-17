"use client";

import { useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { CodeBracketsIcon, DatabaseIcon, SparkleIcon, SwapIcon } from "@/components/icons";
import {
  certificationCategories,
  certificationSortDate,
  certifications,
  type Certification,
  type CertificationCategoryId,
} from "@/lib/data/certifications";
import { CertificationCard } from "./certification-card";

const CATEGORY_ICONS: Record<CertificationCategoryId, typeof CodeBracketsIcon> = {
  development: CodeBracketsIcon,
  data: DatabaseIcon,
  professional: SparkleIcon,
};

const FILTERS: { id: CertificationCategoryId | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...certificationCategories.map((c) => ({ id: c.id, label: c.label })),
];

type SortMode = "linked" | "newest" | "oldest" | "az" | "issuer";

// Cycled through by the sort button below, in this order — click steps
// to the next one and wraps back to "linked". "linked" is also the
// default on page load, so a visitor sees the verifiable credentials
// first rather than having to dig for which ones actually prove
// anything.
const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "linked", label: "Linked first" },
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "az", label: "A-Z" },
  { id: "issuer", label: "By issuer" },
];

function sortCerts(certs: Certification[], sort: SortMode): Certification[] {
  const sorted = [...certs];
  if (sort === "az") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "issuer") {
    // Issuer first, then name as a tiebreaker so a provider with several
    // certs (HackerRank, DataCamp, etc.) doesn't just land in data-entry
    // order within its own group.
    sorted.sort(
      (a, b) =>
        a.issuer.localeCompare(b.issuer) || a.name.localeCompare(b.name)
    );
  } else if (sort === "linked") {
    // Has-a-link first; newest-first within each of those two groups so
    // it doesn't otherwise look unordered.
    sorted.sort((a, b) => {
      const linked = Number(Boolean(b.credentialUrl)) - Number(Boolean(a.credentialUrl));
      return linked !== 0
        ? linked
        : certificationSortDate(b) - certificationSortDate(a);
    });
  } else {
    sorted.sort((a, b) => certificationSortDate(b) - certificationSortDate(a));
    if (sort === "oldest") sorted.reverse();
  }
  return sorted;
}

function CertificationGrid({ certs }: { certs: Certification[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {certs.map((cert) => {
        const CategoryIcon = CATEGORY_ICONS[cert.category];
        const categoryLabel =
          certificationCategories.find((c) => c.id === cert.category)
            ?.label ?? cert.category;
        return (
          <CertificationCard
            key={cert.name}
            cert={cert}
            categoryLabel={categoryLabel}
            icon={<CategoryIcon className="h-6 w-6" aria-hidden="true" />}
          />
        );
      })}
    </div>
  );
}

/** Same filter-pills-above-a-reflowing-grid mechanism Projects and
 * Recommendations already use, scoped into two tiers rather than one
 * flat list — a proctored, formally-issued credential (AWS, Google
 * Cloud, etc.) isn't really the same category of thing as a Coursera/
 * online-course certificate of completion, so they get their own
 * sections instead of being sorted together by border color alone. The
 * category filter and sort order both apply to each section
 * independently. */
export default function CertificationsPage() {
  const [filter, setFilter] = useState<CertificationCategoryId | "all">(
    "all"
  );
  // Cycles rather than a dropdown — same "click to advance" shape as the
  // Expand all/Collapse all button on Skills and Recommendations, just
  // with more than two states. Defaults to "linked" (see SORT_OPTIONS).
  const [sort, setSort] = useState<SortMode>("linked");
  const sortLabel = SORT_OPTIONS.find((o) => o.id === sort)!.label;

  function cycleSort() {
    setSort((prev) => {
      const index = SORT_OPTIONS.findIndex((o) => o.id === prev);
      return SORT_OPTIONS[(index + 1) % SORT_OPTIONS.length].id;
    });
  }

  const filtered =
    filter === "all"
      ? certifications
      : certifications.filter((c) => c.category === filter);
  const official = sortCerts(
    filtered.filter((c) => c.tier === "major"),
    sort
  );
  const courses = sortCerts(
    filtered.filter((c) => c.tier === "standard"),
    sort
  );

  return (
    <PageShell watermark="CERTIFICATIONS">
      <PageHeading eyebrow="Credentials">Certifications</PageHeading>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
        {certifications.length} credentials across{" "}
        {certificationCategories.length} areas - official, proctored
        certifications separated from course-completion certificates.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.id === "all"
                ? certifications.length
                : certifications.filter((c) => c.category === f.id).length;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
                  active
                    ? "border-accent/50 bg-accent text-white"
                    : "border-line bg-panel text-ink-faint hover:text-ink-soft"
                }`}
              >
                {f.label}
                <sup className="text-[11px] font-semibold">{count}</sup>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={cycleSort}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-accent-soft transition-colors hover:text-accent"
        >
          <SwapIcon className="h-3.5 w-3.5 rotate-90" aria-hidden="true" />
          {sortLabel}
        </button>
      </div>

      <div
        key={`${filter}-${sort}`}
        className="mt-8 flex flex-col gap-12 [animation:tab-panel-in_0.5s_ease-out] motion-reduce:[animation:none]"
      >
        {official.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
              Official Certifications
            </h3>
            <p className="mt-1 text-xs text-ink-faint">
              Formally proctored, issued by the certifying body directly.
            </p>
            <div className="mt-4">
              <CertificationGrid certs={official} />
            </div>
          </div>
        )}

        {courses.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
              Course Certificates
            </h3>
            <p className="mt-1 text-xs text-ink-faint">
              Completion certificates from online courses (Coursera and
              similar).
            </p>
            <div className="mt-4">
              <CertificationGrid certs={courses} />
            </div>
          </div>
        )}

        {official.length === 0 && courses.length === 0 && (
          <p className="text-sm text-ink-faint">
            No certifications in this category yet.
          </p>
        )}
      </div>
    </PageShell>
  );
}
