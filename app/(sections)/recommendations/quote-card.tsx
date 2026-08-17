import { QuoteIcon } from "@/components/icons";
import { recommendations, type PreviewQuote } from "@/lib/data/recommendations";

export function QuoteCard({ preview }: { preview: PreviewQuote }) {
  const source = preview.recommendationId
    ? recommendations.find((r) => r.id === preview.recommendationId)
    : undefined;

  return (
    <div className="mb-4 break-inside-avoid rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[6px]">
      <QuoteIcon className="h-6 w-6 text-accent" />
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {preview.quote}
      </p>
      {source && (
        <p className="mt-3 text-xs font-medium text-ink-faint">
          &mdash; {source.recommenderName}, {source.recommenderTitle} at{" "}
          {source.company}
        </p>
      )}
    </div>
  );
}
