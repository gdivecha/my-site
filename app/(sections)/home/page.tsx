import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Tag } from "@/components/Pill";
import { ArrowRightIcon, DownloadIcon } from "@/components/icons";
import {
  certificationSortDate,
  certifications,
} from "@/lib/data/certifications";
import { experiences } from "@/lib/data/experience";
import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { previewQuotes, recommendations } from "@/lib/data/recommendations";
import { BioText } from "./bio-text";
import { IntroHero } from "./intro-hero";
import { ScrollHint } from "./scroll-hint";

// Array order is chronological (most recent first) for both — see their
// respective data files. No "featured" flag exists yet for projects, so
// this just takes the first one; swap the index here if a different
// project should lead.
const featuredProject = projects[0];
// The second (2024) of two Amazon internships — "amazon-fba-inbound" —
// rather than experiences[0], which would just be whatever's most recent.
const featuredRole = experiences.find((e) => e.id === "amazon-fba-inbound")!;
// Not previewQuotes[0] (the highest-authority one, Chris Zou) — it's a
// longer quote that line-clamp-3 was cutting off mid-thought here ("...
// combined with this..."). This one (Azmat Mungur, Senior Performance
// Engineer) is short enough to read as a complete sentence in the card
// instead of trailing off.
const featuredQuote = previewQuotes.find((q) => q.id === "preview-4")!;
// Most recently earned by date, not data-entry order — the Udemy entry
// (no date yet, see lib/data/certifications.ts) sorts as "oldest" via
// certificationSortDate's 0-fallback, so it's correctly excluded here.
const featuredCert = certifications.reduce((latest, c) =>
  certificationSortDate(c) > certificationSortDate(latest) ? c : latest
);

export const metadata: Metadata = {
  title: "Home",
  description: profile.tagline,
};

export default function HomePage() {
  return (
    <PageShell watermark="HOME">
      <div className="flex w-full max-w-2xl flex-col items-start gap-6">
        {/* Sized to fill roughly the rest of the viewport below the
            page heading — keeps the CTAs and "Elsewhere on this site"
            section off-screen at first, so the page's first impression
            is the intro alone, with ScrollHint (a real part of this
            flow) hinting there's more below and, on click, scrolling
            straight to it. 100vh flat (not accounting for the
            heading/padding already consumed above this block) overshot
            by roughly that same amount, leaving a big dead gap once
            scrolled past — 12rem/18rem are deliberately rough stand-ins
            for that already-used space (mobile's own header — name,
            role, utility icons, no sidebar nav row alongside it —
            consumes proportionally more of a short viewport than
            desktop's does, hence the larger offset there), not a
            measured constant like PageHeading's own alignment math
            elsewhere on this page. This reservation is what actually
            gives ScrollHint's own centering (see scroll-hint.tsx —
            between the bio's "Read more" toggle and the mobile dial
            nav's top edge, an explicit request) genuine layout room to
            land in without visually overlapping "Elsewhere on this
            site" below it, which is positioned by plain document flow
            and has no idea ScrollHint moves itself via a transform. */}
        <div className="flex min-h-[calc(100vh-24rem)] w-full flex-col justify-between gap-6 pb-0 sm:min-h-[calc(100vh-12rem)] sm:pb-8 md:pb-10">
          {/* A single CSS Grid (see .home-intro-grid, globals.css) whose
              four items — title, photo, pills, bio — get reassigned
              between two grid-template-areas layouts by breakpoint,
              rather than existing twice in the DOM: mobile puts the
              photo beside the title with the pills stacked underneath
              it, desktop keeps the title full-width above the photo+
              pills row (the original layout). The photo especially must
              only ever render once — two copies would mean two
              priority-loaded <Image>s competing for the same network
              slot. */}
          <div className="home-intro-grid w-full">
            <IntroHero />
            <BioText paragraphs={profile.bio} />
          </div>

          <ScrollHint />
        </div>

        {/* The one thing only this page does: a quick taste of the rest
            of the site, each card linking to its full page. Every other
            page just enumerates one category of content — this is the
            spot that's positioned to summarize across all of them.
            Asymmetric on purpose: the featured project leads as a wide
            card (it's the deepest content on the site — see its own
            breakdown page), with the other three as a lighter-weight row
            underneath rather than four equal boxes competing for
            attention. */}
        <div id="elsewhere-on-this-site" className="w-full">
          <div className="flex flex-wrap items-baseline justify-end gap-x-4 gap-y-1 md:justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
              Elsewhere on this site
            </h2>
            <p className="font-mono text-[11px] text-ink-faint">
              {projects.length} projects · {certifications.length} certifications · {recommendations.length} recommendations
            </p>
          </div>

          <div className="mt-4 grid gap-4">
            <Link
              href={`/projects/${featuredProject.slug}`}
              className="group rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover sm:p-6"
            >
              <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent-soft">
                <span aria-hidden="true">🚀</span>
                Featured project
                <ArrowRightIcon className="hidden h-3 w-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 md:block" />
              </p>
              <p className="mt-2 text-base font-semibold text-ink transition-colors group-hover:text-accent-soft">
                {featuredProject.name}
              </p>
              <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-ink-faint sm:text-sm">
                {featuredProject.description}
              </p>
              <div className="mt-3 flex flex-wrap justify-end gap-1.5 md:justify-start">
                {featuredProject.tags.slice(0, 4).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </Link>

            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/experience"
                className="group rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
              >
                <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent-soft">
                  <span aria-hidden="true">💼</span>
                  Featured role
                  <ArrowRightIcon className="hidden h-3 w-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 md:block" />
                </p>
                <p className="mt-2 text-sm font-semibold text-ink transition-colors group-hover:text-accent-soft">
                  {featuredRole.role}
                </p>
                <p className="mt-1 text-xs text-ink-faint">
                  {featuredRole.company}
                </p>
              </Link>

              <Link
                href="/recommendations"
                className="group rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
              >
                <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent-soft">
                  <span aria-hidden="true">💬</span>
                  What people say
                  <ArrowRightIcon className="hidden h-3 w-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 md:block" />
                </p>
                <p className="mt-2 line-clamp-3 text-xs italic leading-relaxed text-ink-soft">
                  &ldquo;{featuredQuote.quote}&rdquo;
                </p>
              </Link>

              <Link
                href="/certifications"
                className="group rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
              >
                <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent-soft">
                  <span aria-hidden="true">🏅</span>
                  Certifications
                  <ArrowRightIcon className="hidden h-3 w-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 md:block" />
                </p>
                <p className="mt-2 text-sm font-semibold text-ink transition-colors group-hover:text-accent-soft">
                  {certifications.length} credentials earned
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-faint">
                  Most recently: {featuredCert.name}
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Plain links to the real pages, not the form/résumé themselves
            inlined here — this is a prompt to go there, not a substitute
            for going there, so Contact and Portfolio stay the actual
            place those things happen rather than becoming redundant.
            Closes the page rather than opening it — everything above
            (bio, featured cards) is the pitch; this is the payoff once
            someone's actually read it. */}
        {/* w-full — this row's own parent uses items-start (see the
            outer flex-col above), so without an explicit width the row
            shrink-wraps to its own content and sits flush left there
            regardless of justify-end: there's no extra width left inside
            the row for justify-end to actually push against. Confirmed
            empirically: the buttons rendered left-aligned on mobile
            despite justify-end already being set, until this was added. */}
        <div className="flex w-full flex-wrap items-center justify-end gap-5 md:justify-start">
          {/* Primary: the site's own signature gradient (same two stops
              as the name and the Skills graph's root node), with real
              weight and a lift on hover — this is the one action the
              page is actually pointing at. */}
          <Link
            href="/contact"
            // text-[var(--color-base)] rather than a literal white: base
            // flips to near-black in dark mode against this bright
            // gradient (same trick as the Skills graph's root label and
            // DialNav's active state) and stays near-white in light mode,
            // where it already looked right.
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[var(--color-base)] shadow-lg shadow-accent/25 transition-transform duration-200 hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent-soft), var(--color-accent-deep))",
            }}
          >
            Get in touch
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          {/* Secondary: deliberately lighter-weight — a plain link, not
              a second competing button — so there's one clear primary
              action rather than two pills of equal weight. */}
          <Link
            href="/portfolio"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-accent-soft"
          >
            <DownloadIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            Download résumé
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
