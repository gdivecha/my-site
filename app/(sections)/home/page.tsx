import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { Pill, Tag } from "@/components/Pill";
import { ArrowRightIcon, DownloadIcon } from "@/components/icons";
import {
  certificationSortDate,
  certifications,
} from "@/lib/data/certifications";
import { experiences } from "@/lib/data/experience";
import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { previewQuotes, recommendations } from "@/lib/data/recommendations";
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
      <PageHeading eyebrow="Home">Hi there...</PageHeading>

      <div className="mt-6 flex w-full max-w-2xl flex-col items-start gap-6">
        {/* Sized to fill roughly the rest of the viewport below the
            page heading — keeps the CTAs and "Elsewhere on this site"
            section off-screen at first, so the page's first impression
            is the intro alone, with ScrollHint (a real part of this
            flow, pinned to this block's own bottom via justify-between)
            hinting there's more below and, on click, scrolling straight
            to it. 100vh flat (not accounting for the heading/padding
            already consumed above this block) overshot by roughly that
            same amount, leaving a big dead gap once scrolled past —
            12rem is a deliberately rough stand-in for that already-used
            space, not a measured constant like PageHeading's own
            alignment math elsewhere on this page. The bottom padding
            matches the sidebar copyright line's own bottom-8/bottom-10
            inset (see components/Sidebar.tsx) — at rest (scroll
            position 0, before ScrollHint's own click target moves
            anything) that lines the two up horizontally, even though
            the copyright is fixed and this arrow scrolls with the page
            past that point. */}
        <div className="flex min-h-[calc(100vh-12rem)] w-full flex-col justify-between gap-6 pb-8 md:pb-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-end gap-5">
              {/* A true blob outline (not the standard rounded-rect used
                  everywhere else) — an asymmetric, organic egg/potato shape
                  built from only outward-bulging curves (no concave pinches
                  or notches — those read as "cut off" rather than natural),
                  via clip-path rather than border-radius, which can only
                  produce 4 elliptical corners — so the one portrait on the
                  whole site reads as deliberately different rather than
                  another boxed image. */}
              <div
                className="relative aspect-[4/5] w-full shrink-0 bg-panel"
                style={{
                  maxWidth: "clamp(180px, 24vh, 260px)",
                  // Rotated ~7deg clockwise around its own centroid in true
                  // (non-square) aspect space — rotating the raw percentage
                  // coordinates directly would skew the shape, since 1% of
                  // width != 1% of height at a 4:5 box. See the marginBottom
                  // note below: rotating shifted the shape's bottom-most point
                  // too, from 2.00% to 2.35% of the box's height.
                  clipPath:
                    "polygon(96.80% 62.90%, 95.82% 65.96%, 94.67% 68.96%, 93.30% 71.87%, 91.75% 74.68%, 89.99% 77.39%, 88.02% 79.97%, 85.85% 82.41%, 83.50% 84.70%, 80.96% 86.82%, 78.26% 88.74%, 75.42% 90.47%, 72.46% 92.01%, 69.41% 93.35%, 66.29% 94.48%, 63.11% 95.43%, 59.91% 96.19%, 56.69% 96.78%, 53.45% 97.22%, 50.23% 97.50%, 47.01% 97.65%, 43.80% 97.65%, 40.60% 97.53%, 37.41% 97.28%, 34.23% 96.89%, 31.07% 96.34%, 27.94% 95.65%, 24.85% 94.78%, 21.81% 93.74%, 18.86% 92.49%, 16.02% 91.05%, 13.32% 89.39%, 10.79% 87.53%, 8.48% 85.47%, 6.41% 83.21%, 4.61% 80.79%, 3.11% 78.22%, 1.93% 75.54%, 1.08% 72.77%, 0.53% 69.96%, 0.31% 67.14%, 0.37% 64.32%, 0.70% 61.55%, 1.25% 58.85%, 2.00% 56.22%, 2.88% 53.68%, 3.89% 51.21%, 4.97% 48.80%, 6.09% 46.47%, 7.25% 44.14%, 8.41% 41.84%, 9.58% 39.50%, 10.78% 37.12%, 12.02% 34.69%, 13.34% 32.17%, 14.76% 29.56%, 16.34% 26.88%, 18.11% 24.14%, 20.12% 21.37%, 22.40% 18.60%, 24.97% 15.88%, 27.87% 13.26%, 31.09% 10.82%, 34.62% 8.58%, 38.44% 6.64%, 42.53% 5.03%, 46.83% 3.81%, 51.27% 3.02%, 55.81% 2.68%, 60.36% 2.81%, 64.86% 3.42%, 69.24% 4.50%, 73.44% 6.02%, 77.38% 7.96%, 81.05% 10.26%, 84.37% 12.90%, 87.35% 15.80%, 89.96% 18.93%, 92.20% 22.23%, 94.08% 25.64%, 95.61% 29.13%, 96.81% 32.66%, 97.72% 36.19%, 98.35% 39.71%, 98.73% 43.19%, 98.89% 46.62%, 98.85% 50.00%, 98.61% 53.32%, 98.18% 56.57%, 97.58% 59.76%)",
                }}
              >
                <Image
                  src="/profile.jpg"
                  alt={profile.name}
                  fill
                  sizes="260px"
                  className="object-cover"
                  priority
                />
              </div>

              {/* The blob's outline still pulls its visible bottom edge in
                  from the box's true bottom edge slightly — ~2.35% of its own
                  height post-rotation (see the clip-path generation script) —
                  2.94% of the photo's width, since height = width × 5/4.
                  items-end aligns the box edges, not the visible shape, so
                  without this the pills' bottom sits slightly below the
                  blob's actual visible bottom. */}
              <div
                className="flex shrink-0 flex-col gap-2.5"
                style={{ marginBottom: "calc(clamp(180px, 24vh, 260px) * 0.0294)" }}
              >
                <Pill icon={<span aria-hidden="true">💼</span>}>
                  2+ years of experience in SWE
                </Pill>
                <Pill icon={<span aria-hidden="true">🎓</span>}>
                  {profile.education}
                </Pill>
                <Pill icon={<span aria-hidden="true">📍</span>}>
                  {profile.location}
                </Pill>
                <Pill icon={<span aria-hidden="true">🟢</span>}>
                  Available for opportunities
                </Pill>
              </div>
            </div>

            <div className="space-y-3 text-left text-sm leading-relaxed text-ink-soft md:text-[15px]">
              {profile.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
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
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
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
                <ArrowRightIcon className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
              </p>
              <p className="mt-2 text-base font-semibold text-ink transition-colors group-hover:text-accent-soft">
                {featuredProject.name}
              </p>
              <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-ink-faint sm:text-sm">
                {featuredProject.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
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
                  <ArrowRightIcon className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
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
                  <ArrowRightIcon className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
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
                  <ArrowRightIcon className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
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
        <div className="flex flex-wrap items-center gap-5">
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
