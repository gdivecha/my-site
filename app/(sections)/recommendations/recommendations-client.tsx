"use client";

import { useMemo, useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { ChevronDownIcon } from "@/components/icons";
import { FilterMenu } from "@/components/FilterMenu";
import { recommendations, previewQuotes } from "@/lib/data/recommendations";
import { QuoteCard } from "./quote-card";
import { RoleCard } from "./role-card";

// The category tabs (Content Creation, Artist, Freelance) are hidden for
// now — this always shows Software Engineering. Bring back the tab row to
// let visitors switch categories again.
const CATEGORY = "software-engineering" as const;

export function RecommendationsPageClient() {
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

  const [openTerms, setOpenTerms] = useState<Set<string>>(new Set());
  const allOpen =
    roleGroups.length > 0 && roleGroups.every((g) => openTerms.has(g.term));

  function toggleAll() {
    setOpenTerms((prev) => {
      const next = new Set(prev);
      roleGroups.forEach((g) => (allOpen ? next.delete(g.term) : next.add(g.term)));
      return next;
    });
  }

  function toggleOne(term: string) {
    setOpenTerms((prev) => {
      const next = new Set(prev);
      if (next.has(term)) {
        next.delete(term);
      } else {
        next.add(term);
      }
      return next;
    });
  }

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

          {/* "Expand all" used to be stacked below the company filter on
              mobile — needed when the filter was a whole row of pills,
              but now that FilterMenu collapses that into one compact
              button (see below), it's the same "one small control beside
              another" shape as desktop, so they share a line here too. */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 md:justify-between">
            {/* Mobile: the same options collapsed into one tappable
                control (see FilterMenu) instead of a pill row that would
                otherwise wrap across several lines. Desktop keeps the
                full pill row. order-2 — on mobile the filter sits to the
                right of "Expand all" (see its own order-1 below);
                desktop keeps the original (unreordered) DOM order. */}
            <FilterMenu
              options={companiesForCategory.map((c) => ({ id: c, label: c }))}
              activeId={activeCompany}
              onSelect={setCompany}
              label="Filter by company"
              className="order-2 md:order-none"
            />
            <div className="hidden flex-wrap gap-2 md:flex md:justify-start">
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
                        : "filter-pill border-line bg-panel text-ink-faint hover:text-ink-soft"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={toggleAll}
              className="order-1 inline-flex items-center gap-1.5 text-xs font-medium text-accent-soft transition-colors hover:text-accent md:order-none"
            >
              {allOpen ? "Collapse all" : "Expand all"}
              <ChevronDownIcon
                className={`h-3.5 w-3.5 transition-transform ${allOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <div
            key={activeCompany}
            className="mt-6 flex flex-col gap-4 [animation:tab-panel-in_0.5s_ease-out] motion-reduce:[animation:none]"
          >
            {roleGroups.map((group) => (
              <RoleCard
                key={group.term}
                role={group.role}
                term={group.term}
                recommendations={group.recs}
                expanded={openTerms.has(group.term)}
                onToggle={() => toggleOne(group.term)}
              />
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
