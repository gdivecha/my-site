"use client";

import { useMemo, useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import {
  recommendations,
  recommendationCategories,
  previewQuotes,
  type RecommendationCategory,
} from "@/lib/data/recommendations";
import { QuoteCard } from "./quote-card";
import { RoleCard } from "./role-card";

export default function RecommendationsPage() {
  const [category, setCategory] = useState<RecommendationCategory>(
    recommendationCategories[0].id
  );

  const filteredQuotes = previewQuotes.filter((q) => q.category === category);

  // The "Interested in reading more?" section is scoped to the currently
  // selected category — each category has its own set of companies/roles,
  // not a shared global list.
  const categoryRecs = recommendations.filter((r) => r.category === category);
  const companiesForCategory = Array.from(
    new Set(categoryRecs.map((r) => r.company))
  );

  const [company, setCompany] = useState<string>(companiesForCategory[0]);
  const activeCompany = companiesForCategory.includes(company)
    ? company
    : companiesForCategory[0];

  const companyRecs = categoryRecs.filter((r) => r.company === activeCompany);
  const roleGroups = useMemo(
    () =>
      Array.from(
        companyRecs.reduce((map, rec) => {
          const key = rec.role;
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(rec);
          return map;
        }, new Map<string, typeof recommendations>())
      ).map(([role, recs]) => ({ role, term: recs[0].term, recs })),
    [companyRecs]
  );

  function handleCategoryChange(next: RecommendationCategory) {
    setCategory(next);
    const nextCompanies = Array.from(
      new Set(
        recommendations.filter((r) => r.category === next).map((r) => r.company)
      )
    );
    setCompany(nextCompanies[0]);
  }

  return (
    <PageShell watermark="RECOMMENDATIONS">
      <PageHeading eyebrow="Recommendations">
        What others say about me
      </PageHeading>

      <div className="mt-8 flex flex-wrap gap-2">
        {recommendationCategories.map((c) => {
          const count = previewQuotes.filter((q) => q.category === c.id).length;
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCategoryChange(c.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
                active
                  ? "border-accent/50 bg-accent text-ink"
                  : "border-line bg-panel text-ink-faint hover:text-ink-soft"
              }`}
            >
              {c.label}
              <sup className="text-[11px] font-semibold">{count}</sup>
            </button>
          );
        })}
      </div>

      <div className="mt-8 max-w-4xl columns-1 gap-4 sm:columns-2">
        {filteredQuotes.map((quote) => (
          <QuoteCard key={quote.id} preview={quote} />
        ))}
      </div>

      {companiesForCategory.length > 0 && (
        <div className="mt-20 max-w-2xl">
          <h3 className="font-display text-2xl font-bold text-ink">
            Interested in reading more?
          </h3>

          <div className="mt-6 flex flex-wrap gap-2">
            {companiesForCategory.map((c) => {
              const active = activeCompany === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCompany(c)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
                    active
                      ? "border-accent/50 bg-accent text-ink"
                      : "border-line bg-panel text-ink-faint hover:text-ink-soft"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {roleGroups.map((group) => (
              <RoleCard
                key={group.role}
                role={group.role}
                term={group.term}
                recommendations={group.recs}
              />
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
