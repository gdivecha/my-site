import { QuoteIcon } from "@/components/icons";
import type { Recommendation } from "@/lib/data/recommendations";

export function QuoteCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <div className="mb-4 break-inside-avoid rounded-2xl border border-line bg-panel p-6">
      <QuoteIcon className="h-6 w-6 text-accent" />
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        &ldquo;{recommendation.quote}&rdquo;
      </p>
      <p className="mt-4 text-xs text-ink-faint">
        {recommendation.recommenderName} · {recommendation.recommenderTitle}
      </p>
    </div>
  );
}
