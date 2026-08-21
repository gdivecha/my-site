import { QuoteIcon } from "@/components/icons";
import { recommendations, type PreviewQuote } from "@/lib/data/recommendations";

export function QuoteCard({ preview }: { preview: PreviewQuote }) {
  const source = preview.recommendationId
    ? recommendations.find((r) => r.id === preview.recommendationId)
    : undefined;

  return (
    <div className="mb-4 break-inside-avoid rounded-2xl border border-line bg-card-tint p-6 md:text-left backdrop-blur-[6px]">
      {/* ml-auto, not text-align — Tailwind's preflight sets svg to
          display:block, so text-align (already inherited as text-right
          on mobile from PageShell, reset via md:text-left above) has no
          effect on a block element's own position, only on inline
          content. A block element's own margin is what actually moves it. */}
      <QuoteIcon className="ml-auto h-6 w-6 text-accent md:ml-0" />
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
