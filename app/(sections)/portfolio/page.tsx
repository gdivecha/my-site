import { PageShell } from "@/components/PageShell";
import { DownloadIcon } from "@/components/icons";

export default function PortfolioPage() {
  return (
    <PageShell variant="portfolio" watermark="PORTFOLIO">
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
        Portfolio
      </p>
      <h2 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        My Résumé
      </h2>

      <div className="mt-8 max-w-2xl rounded-2xl border border-line bg-panel p-6 md:p-8">
        <iframe
          src="/resume.pdf"
          title="Gaurav Divecha — Résumé"
          className="aspect-[8.5/11] w-full rounded-xl border border-line bg-white"
        />

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm font-medium text-ink">My Résumé</span>
          <a
            href="/resume.pdf"
            download
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink transition-colors hover:bg-accent-deep"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Download
          </a>
        </div>
      </div>
    </PageShell>
  );
}
