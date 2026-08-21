import { ChevronDownIcon } from "@/components/icons";
import { Tag } from "@/components/Pill";
import type { Recommendation } from "@/lib/data/recommendations";
import { RecommenderEntry } from "./recommender-entry";

export function RoleCard({
  role,
  term,
  recommendations,
  expanded,
  onToggle,
}: {
  role: string;
  term: string;
  recommendations: Recommendation[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[6px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover">
      {/* text-right: a native <button> defaults to text-align:center in
          the browser's own UA stylesheet — nothing here was overriding
          that on mobile (only md:text-left existed), so the role text
          was centering itself by browser default rather than any
          intentional layout, which is why it read as centered instead
          of right-aligned like the rest of the page. justify-end (mobile
          only) is the separate fix for the chevron, which sits alone on
          its own wrapped flex line below the title — text-align doesn't
          reposition a flex item's own box, only the text inside it. */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-end gap-x-4 gap-y-2 text-right md:justify-between md:text-left"
        aria-expanded={expanded}
      >
        <div>
          <h4 className="text-sm font-semibold text-ink transition-colors group-hover:text-accent-soft">
            {role}
          </h4>
          {/* The chevron below is duplicated for mobile (hidden md:block
              on the original, md:hidden on this one) rather than shared
              — on mobile it sits inline with the recommendation count so
              the two read as one line instead of the count stranding
              itself alone above a separate chevron line; desktop keeps
              the original vertically-centered position at the end of
              the whole row, which relies on being a direct sibling of
              this title block, not nested inside it. */}
          <div className="mt-1.5 flex flex-wrap items-center justify-end gap-2 md:justify-start">
            <Tag>{term}</Tag>
            <span className="text-xs text-ink-faint">
              {recommendations.length}{" "}
              {recommendations.length === 1 ? "recommendation" : "recommendations"}
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 shrink-0 text-ink-faint transition-all duration-150 group-hover:text-accent-soft md:hidden ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
        <ChevronDownIcon
          className={`hidden h-4 w-4 shrink-0 text-ink-faint transition-all duration-150 group-hover:text-accent-soft md:block ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="mt-5 flex flex-col gap-4">
          {recommendations.map((rec) => (
            <RecommenderEntry key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
