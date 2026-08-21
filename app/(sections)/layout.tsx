import { Copyright } from "@/components/Copyright";
import { Sidebar } from "@/components/Sidebar";

export default function SectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // flex-col min-h-screen HERE, not just on <main> — below md, Sidebar
    // and main stack in normal block flow rather than sitting side by
    // side, so each one enforcing its own independent min-h-screen
    // summed to well over one actual viewport (Sidebar's own natural
    // height, PLUS a full extra screen from main): confirmed via a real
    // measurement, a short-content page landed at 1072px document height
    // against an 844px viewport, forcing a scroll to reach copyright
    // even though the visible content was short enough to need none.
    // Sharing ONE min-h-screen budget across both (main's own flex-1
    // below fills whatever Sidebar didn't already use) is what actually
    // caps a short page at exactly one screen.
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      {/* flex-col + the content wrapper's own flex-1 is what actually
          pins copyright a consistent distance from the bottom on every
          page, short or long, instead of it trailing wherever that
          page's content happens to end. Long content still pushes
          copyright below the fold exactly as before; nothing changes
          there. */}
      <main className="relative flex flex-1 flex-col md:ml-[clamp(360px,40vw,640px)]">
        <div className="flex-1">{children}</div>
        {/* md+ shows the sidebar's own fixed copyright instead (see
            Sidebar.tsx) — this is mobile-only, and lives here rather than
            inside each page (or PageShell) specifically so it's the same
            one instance for every tab.

            pb-16 (not a plain pb-8) is deliberate: this is genuinely the
            last thing on every page now, so it's what has to clear
            DialNav's fixed horizontal bar on mobile (56px bar +
            safe-area inset + a little breathing room) — that clearance
            used to live on PageShell itself, back when its own content
            was the last thing before the page ended; now that this
            copyright renders after it, the clearance has to move down
            here with it, or the copyright ends up sitting behind the
            dial instead of above it. */}
        <Copyright className="shrink-0 px-6 pb-16 text-right text-xs text-ink-faint sm:px-10 md:hidden" />
      </main>
    </div>
  );
}
