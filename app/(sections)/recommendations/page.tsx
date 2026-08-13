"use client";

import { useMemo, useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { recommendations, previewQuotes } from "@/lib/data/recommendations";
import { QuoteCard } from "./quote-card";
import { RoleCard } from "./role-card";

// The category tabs (Content Creation, Artist, Freelance) are hidden for
// now — this always shows Software Engineering. Bring back the tab row to
// let visitors switch categories again.
const CATEGORY = "software-engineering" as const;

export default function RecommendationsPage() {
  const filteredQuotes = previewQuotes.filter((q) => q.category === CATEGORY);

  const categoryRecs = recommendations.filter((r) => r.category === CATEGORY);
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
          // Group by term, not role — the same generic role title can repeat
          // across different stints (e.g. two separate summer internships),
          // and those should stay in separate cards.
          const key = rec.term;
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(rec);
          return map;
        }, new Map<string, typeof recommendations>())
      ).map(([term, recs]) => ({ role: recs[0].role, term, recs })),
    [companyRecs]
  );

  return (
    <PageShell watermark="RECOMMENDATIONS">
      <PageHeading eyebrow="Recommendations">
        What others say about me
      </PageHeading>

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
                      ? "border-accent/50 bg-accent text-white"
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
                key={group.term}
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
