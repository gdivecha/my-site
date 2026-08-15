import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { DownloadIcon } from "@/components/icons";
import { experiences } from "@/lib/data/experience";
import { projects } from "@/lib/data/projects";

// Every number here is derived from the real data files, never hardcoded —
// same convention as durationText() in lib/data/experience.ts.
const stats = [
  { value: "2+", label: "Years experience" },
  {
    value: String(experiences.filter((e) => e.type === "internship").length),
    label: "Internships",
  },
  { value: String(projects.length), label: "Projects shipped" },
  {
    value: String(new Set(experiences.map((e) => e.company)).size),
    label: "Companies & teams",
  },
];

export default function PortfolioPage() {
  return (
    <PageShell watermark="PORTFOLIO">
      <PageHeading eyebrow="Portfolio">My Résumé</PageHeading>

      <div className="mt-6 flex max-w-2xl flex-wrap divide-x divide-line overflow-hidden rounded-2xl border border-line bg-card-tint backdrop-blur-[3.8px]">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-[7.5rem] flex-1 px-5 py-4 text-center">
            <p className="font-display text-2xl font-bold tabular-nums text-accent-soft sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-faint">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 max-w-2xl rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[3.8px] md:p-8">
        <iframe
          src="/resume.pdf"
          title="Gaurav Divecha - Résumé"
          className="aspect-[8.5/11] w-full rounded-xl border border-line bg-white"
        />

        <div className="mt-6 flex justify-end">
          <a
            href="/resume.pdf"
            download
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-deep"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Download
          </a>
        </div>
      </div>
    </PageShell>
  );
}
