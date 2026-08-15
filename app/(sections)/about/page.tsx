import Image from "next/image";
import Link from "next/link";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { Pill } from "@/components/Pill";
import { ArrowRightIcon } from "@/components/icons";
import { experiences } from "@/lib/data/experience";
import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { previewQuotes } from "@/lib/data/recommendations";

// Array order is chronological (most recent first) for both — see their
// respective data files. No "featured" flag exists yet for projects, so
// this just takes the first one; swap the index here if a different
// project should lead.
const featuredProject = projects[0];
// The second (2024) of two Amazon internships — "amazon-fba-inbound" —
// rather than experiences[0], which would just be whatever's most recent.
const featuredRole = experiences.find((e) => e.id === "amazon-fba-inbound")!;
const featuredQuote = previewQuotes[0];

export default function AboutPage() {
  return (
    <PageShell watermark="ABOUT">
      <PageHeading eyebrow="About">Hi there...</PageHeading>

      <div className="mt-6 flex w-full max-w-2xl flex-col items-start gap-6">
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
              clipPath:
                "polygon(97.59% 58.09%, 97.09% 61.22%, 96.40% 64.31%, 95.49% 67.33%, 94.38% 70.27%, 93.04% 73.13%, 91.48% 75.89%, 89.70% 78.52%, 87.71% 81.02%, 85.51% 83.37%, 83.13% 85.54%, 80.57% 87.54%, 77.87% 89.35%, 75.05% 90.98%, 72.12% 92.41%, 69.11% 93.66%, 66.05% 94.73%, 62.94% 95.63%, 59.80% 96.38%, 56.64% 96.97%, 53.47% 97.43%, 50.28% 97.75%, 47.09% 97.94%, 43.88% 98.00%, 40.67% 97.92%, 37.45% 97.69%, 34.24% 97.31%, 31.04% 96.75%, 27.86% 96.01%, 24.74% 95.06%, 21.70% 93.90%, 18.77% 92.52%, 15.98% 90.92%, 13.37% 89.10%, 10.97% 87.06%, 8.82% 84.83%, 6.94% 82.43%, 5.36% 79.88%, 4.09% 77.22%, 3.12% 74.48%, 2.47% 71.70%, 2.10% 68.90%, 2.00% 66.12%, 2.14% 63.38%, 2.48% 60.70%, 2.97% 58.09%, 3.59% 55.54%, 4.30% 53.05%, 5.06% 50.62%, 5.85% 48.20%, 6.65% 45.80%, 7.46% 43.37%, 8.29% 40.89%, 9.15% 38.35%, 10.07% 35.72%, 11.09% 32.99%, 12.25% 30.18%, 13.59% 27.29%, 15.16% 24.34%, 17.00% 21.37%, 19.14% 18.42%, 21.62% 15.54%, 24.44% 12.80%, 27.60% 10.24%, 31.10% 7.94%, 34.91% 5.94%, 38.99% 4.31%, 43.28% 3.09%, 47.73% 2.31%, 52.27% 2.00%, 56.83% 2.17%, 61.34% 2.81%, 65.74% 3.91%, 69.95% 5.45%, 73.94% 7.38%, 77.64% 9.67%, 81.04% 12.26%, 84.11% 15.11%, 86.83% 18.17%, 89.22% 21.37%, 91.27% 24.69%, 93.00% 28.07%, 94.44% 31.49%, 95.60% 34.92%, 96.51% 38.34%, 97.19% 41.73%, 97.66% 45.08%, 97.93% 48.40%, 98.00% 51.67%, 97.89% 54.90%)",
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
              from the box's true bottom edge slightly — ~2.00% of its own
              height (see the clip-path generation script) — 2.50% of the
              photo's width, since height = width × 5/4. items-end aligns
              the box edges, not the visible shape, so without this the
              pills' bottom sits slightly below the blob's actual visible
              bottom. */}
          <div
            className="flex shrink-0 flex-col gap-2.5"
            style={{ marginBottom: "calc(clamp(180px, 24vh, 260px) * 0.025)" }}
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

        {/* The one thing only this page does: a quick taste of the rest
            of the site, each card linking to its full page. Every other
            page just enumerates one category of content — this is the
            spot that's positioned to summarize across all of them. */}
        <div className="w-full">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
            Elsewhere on this site
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Link
              href={`/projects/${featuredProject.slug}`}
              className="group rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[3.8px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
            >
              <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent-soft">
                Featured project
                <ArrowRightIcon className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
              </p>
              <p className="mt-2 text-sm font-semibold text-ink transition-colors group-hover:text-accent-soft">
                {featuredProject.name}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-faint">
                {featuredProject.description}
              </p>
            </Link>

            <Link
              href="/experience"
              className="group rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[3.8px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
            >
              <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent-soft">
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
              className="group rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[3.8px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
            >
              <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent-soft">
                What people say
                <ArrowRightIcon className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
              </p>
              <p className="mt-2 line-clamp-3 text-xs italic leading-relaxed text-ink-soft">
                &ldquo;{featuredQuote.quote}&rdquo;
              </p>
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
