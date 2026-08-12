"use client";

import { useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import {
  recommendations,
  recommendationCategories,
  recommendationCompanies,
  type RecommendationCategory,
} from "@/lib/data/recommendations";
import { QuoteCard } from "./quote-card";
import { RoleCard } from "./role-card";

export default function RecommendationsPage() {
  const [category, setCategory] = useState<RecommendationCategory>(
    recommendationCategories[0].id
  );
  const [company, setCompany] = useState<string>(recommendationCompanies[0]);

  const filteredQuotes = recommendations.filter((r) => r.category === category);

  const companyRecs = recommendations.filter((r) => r.company === company);
  const roleGroups = Array.from(
    companyRecs.reduce((map, rec) => {
      const key = rec.role;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(rec);
      return map;
    }, new Map<string, typeof recommendations>())
  ).map(([role, recs]) => ({ role, term: recs[0].term, recs }));

  return (
    <PageShell watermark="RECOMMENDATIONS">
      <PageHeading eyebrow="Recommendations">
        What others say about me
      </PageHeading>

      <div className="mt-8 flex flex-wrap gap-2">
        {recommendationCategories.map((c) => {
          const count = recommendations.filter((r) => r.category === c.id).length;
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
                active
                  ? "border-accent/50 bg-accent text-ink"
                  : "border-line bg-panel text-ink-faint hover:text-ink-soft"
              }`}
            >
              {c.label}
              <sup className="text-[10px] font-semibold">{count}</sup>
            </button>
          );
        })}
      </div>

      <div className="mt-8 max-w-4xl columns-1 gap-4 sm:columns-2">
        {filteredQuotes.map((rec) => (
          <QuoteCard key={rec.id} recommendation={rec} />
        ))}
      </div>

      <div className="mt-20 max-w-2xl">
        <h3 className="font-display text-2xl font-bold text-ink">
          Interested in reading more?
        </h3>

        <div className="mt-6 flex flex-wrap gap-2">
          {recommendationCompanies.map((c) => {
            const active = company === c;
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
    </PageShell>
  );
}
