import { QuoteIcon } from "@/components/icons";
import type { PreviewQuote } from "@/lib/data/recommendations";

export function QuoteCard({ preview }: { preview: PreviewQuote }) {
  return (
    <div className="mb-4 break-inside-avoid rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[3.8px] transition-colors hover:bg-card-tint-hover">
      <QuoteIcon className="h-6 w-6 text-accent" />
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {preview.quote}
      </p>
    </div>
  );
}
