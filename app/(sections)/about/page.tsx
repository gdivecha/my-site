import Image from "next/image";
import Link from "next/link";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { Pill } from "@/components/Pill";
import { experiences } from "@/lib/data/experience";
import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { previewQuotes } from "@/lib/data/recommendations";

// Array order is chronological (most recent first) for both — see their
// respective data files. No "featured" flag exists yet for projects, so
// this just takes the first one; swap the index here if a different
// project should lead.
const featuredProject = projects[0];
const latestRole = experiences[0];
const featuredQuote = previewQuotes[0];

export default function AboutPage() {
  return (
    <PageShell watermark="ABOUT">
      <PageHeading eyebrow="About">Hi there...</PageHeading>

      <div className="mt-10 flex w-full max-w-2xl flex-col items-start gap-10">
        <div className="flex items-end gap-5">
          <div
            className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl border border-line bg-panel"
            style={{ maxWidth: "clamp(180px, 24vh, 260px)" }}
          >
            <Image
              src="/profile.png"
              alt={profile.name}
              fill
              sizes="260px"
              className="object-cover"
              priority
            />
          </div>

          <div className="flex shrink-0 flex-col gap-2.5">
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
              className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[3.8px] transition-colors hover:bg-card-tint-hover"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-accent-soft">
                Featured project
              </p>
              <p className="mt-2 text-sm font-semibold text-ink">
                {featuredProject.name}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-faint">
                {featuredProject.description}
              </p>
            </Link>

            <Link
              href="/experience"
              className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[3.8px] transition-colors hover:bg-card-tint-hover"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-accent-soft">
                Latest role
              </p>
              <p className="mt-2 text-sm font-semibold text-ink">
                {latestRole.role}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                {latestRole.company}
              </p>
            </Link>

            <Link
              href="/recommendations"
              className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[3.8px] transition-colors hover:bg-card-tint-hover"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-accent-soft">
                What people say
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
