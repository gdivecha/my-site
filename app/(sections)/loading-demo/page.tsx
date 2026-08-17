import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { REASONABLE_LOAD_WAIT_MS } from "@/lib/entrance-timing";

// Genuinely, not a re-implemented mockup: simulateDelayMs makes THIS
// page's own PageShell take real, extra time to become ready, which
// drives the real DialNav lock (via lib/page-ready.ts) and the real
// watermark shimmer through their actual production code paths — no
// button, no replica. Selecting this tab in the dial is itself the
// simulation.
const SIMULATED_DELAY_MS = 7000;

export default function LoadingDemoPage() {
  return (
    <PageShell watermark="LOADING" simulateDelayMs={SIMULATED_DELAY_MS}>
      <PageHeading eyebrow="Internal">Loading states</PageHeading>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink-soft">
        This tab is wired to take about {(SIMULATED_DELAY_MS / 1000).toFixed(1)}
        s to become ready — long enough to see both &ldquo;still
        loading&rdquo; cues for real, before this text itself appears.
        The watermark behind it shows up right away, same as any tab; the
        dial&rsquo;s lock icon (back in the sidebar) and the
        watermark&rsquo;s shimmer only kick in {REASONABLE_LOAD_WAIT_MS}
        ms after that if content still isn&rsquo;t ready — which, here,
        it deliberately isn&rsquo;t. Every other page on this site
        resolves in a couple of frames and never triggers either.
      </p>
    </PageShell>
  );
}
