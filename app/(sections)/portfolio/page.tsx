import type { Metadata } from "next";
import Image from "next/image";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { DownloadIcon, FileIcon } from "@/components/icons";
import { experiences } from "@/lib/data/experience";
import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { StatsBar } from "./stats-bar";

export const metadata: Metadata = {
  title: "Portfolio",
  description: `${profile.tagline} Résumé, career stats, and downloadable PDF.`,
};

// Every number here is derived from the real data files, never hardcoded —
// same convention as durationText() in lib/data/experience.ts. Companies/
// teams count only real internships (type === "internship"), excluding
// the Ryerson Hyperloop student-team stints (type === "freelance").
const internships = experiences.filter((e) => e.type === "internship");
const stats = [
  { value: "2+", label: "Years experience" },
  { value: String(internships.length), label: "Internships" },
  { value: String(projects.length), label: "Industry projects" },
  {
    value: String(new Set(internships.map((e) => e.company)).size),
    label: "Companies",
  },
  {
    value: String(new Set(internships.map((e) => e.team)).size),
    label: "Teams",
  },
  {
    value: String(experiences.filter((e) => e.returnOffer).length),
    label: "Return offers",
  },
];

export default function PortfolioPage() {
  return (
    <PageShell watermark="PORTFOLIO">
      <PageHeading eyebrow="Portfolio">My Résumé</PageHeading>

      <StatsBar stats={stats} />

      {/* A rendered image of the PDF's first page, not a live iframe embed
          of the PDF itself — Chrome's built-in PDF viewer is a sandboxed
          native plugin, not something we can reliably fit/crop/de-zoom
          from the outside (its toolbar, scrollbar, and default zoom
          behavior aren't controllable enough to guarantee it fills this
          frame cleanly). A static image sidesteps all of that: it scales
          exactly like any other image, with zero risk of the crop/scroll/
          toolbar issues the live embed had. Regenerate with
          `qlmanage -t -s 1600 -o public public/resume.pdf` (then rename
          the output) whenever resume.pdf changes. */}
      <div className="mt-6 max-w-2xl overflow-hidden rounded-2xl border border-line bg-card-tint backdrop-blur-[6px]">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div className="flex min-w-0 items-center gap-2 text-xs text-ink-soft">
            <FileIcon className="h-4 w-4 shrink-0 text-accent-soft" />
            <span className="truncate">resume.pdf</span>
          </div>
          <a
            href="/resume.pdf"
            download
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-deep"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Download
          </a>
        </div>

        <div className="resume-preview-wrap">
          <Image
            src="/resume-preview.png"
            alt="Gaurav Divecha - Résumé"
            width={1131}
            height={1600}
            sizes="(min-width: 672px) 672px, 100vw"
            className="resume-preview-image block w-full"
          />
        </div>
      </div>
    </PageShell>
  );
}
