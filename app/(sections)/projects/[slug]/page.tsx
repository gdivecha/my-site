import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Tag } from "@/components/Pill";
import { ArrowLeftIcon, ArrowRightIcon, GithubIcon, PlayIcon } from "@/components/icons";
import { projects } from "@/lib/data/projects";
import { ApplyBotBreakdown } from "./applybot-breakdown";
import { ProjectBackLink } from "./back-link";
import { BookstoreBreakdown } from "./bookstore-breakdown";
import { CramersBreakdown } from "./cramers-breakdown";
import { FacialRecognitionBreakdown } from "./facial-recognition-breakdown";
import { FoodHubBreakdown } from "./foodhub-breakdown";
import { MicroprocessorBreakdown } from "./microprocessor-breakdown";
import { MultistageAmpBreakdown } from "./multistage-amp-breakdown";
import { NexoraBreakdown } from "./nexora-breakdown";
import { ReliaNetBreakdown } from "./relianet-breakdown";
import { SecureBankingBreakdown } from "./secure-banking-breakdown";
import { StraySafeBreakdown } from "./straysafe-breakdown";
import { TamacordBreakdown } from "./tamacord-breakdown";
import { VideoEmbed } from "./video-embed";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.name,
    description: project.description,
    openGraph: { title: project.name, description: project.description },
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

// Extracts a playable embed URL from a youtube.com/youtu.be link so the
// hero frame can play the video inline instead of just linking out to it.
// Returns null for anything else (including the "#" placeholder), which
// keeps the existing link-out behavior for non-YouTube video URLs.
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (parsed.hostname.replace(/^www\./, "") === "youtube.com") {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
    }
  } catch {
    return null;
  }
  return null;
}

// Projects big enough to earn their own hand-built breakdown instead of
// the generic title+paragraph detail blocks every other project uses.
const CUSTOM_BREAKDOWNS: Record<string, () => ReactNode> = {
  "facial-recognition-attendance-system": () => <FacialRecognitionBreakdown />,
  relianet: () => <ReliaNetBreakdown />,
  straysafe: () => <StraySafeBreakdown />,
  "food-hub-system": () => <FoodHubBreakdown />,
  "bookstore-gui": () => <BookstoreBreakdown />,
  nexora: () => <NexoraBreakdown />,
  "apply-bot": () => <ApplyBotBreakdown />,
  tamacord: () => <TamacordBreakdown />,
  "multi-stage-amplifier": () => <MultistageAmpBreakdown />,
  "fully-functioning-microprocessor": () => <MicroprocessorBreakdown />,
  "cramers-calculator": () => <CramersBreakdown />,
  "secure-banking-system": () => <SecureBankingBreakdown />,
};

// Hero frame is where a demo video will eventually go — hidden for these
// specifically until one's on hand, rather than showing an empty
// placeholder box with nothing to click. A separate list from
// CUSTOM_BREAKDOWNS above since the two are related but not the same
// toggle — a future custom breakdown might still want the hero.
const HIDDEN_HERO_SLUGS = new Set([
  "facial-recognition-attendance-system",
  "relianet",
  "straysafe",
  "food-hub-system",
  "bookstore-gui",
  "nexora",
  "apply-bot",
  "multi-stage-amplifier",
  "fully-functioning-microprocessor",
  "cramers-calculator",
  "secure-banking-system",
]);

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const heroHidden = HIDDEN_HERO_SLUGS.has(project.slug);
  const embedUrl =
    !heroHidden && project.videoUrl && project.videoUrl !== "#"
      ? getYouTubeEmbedUrl(project.videoUrl)
      : null;

  // Wraps around at both ends, so "next" from the last project loops
  // back to the first rather than dead-ending.
  const index = projects.findIndex((p) => p.slug === project.slug);
  const prevProject = projects[(index - 1 + projects.length) % projects.length];
  const nextProject = projects[(index + 1) % projects.length];

  return (
    <PageShell watermark="PROJECTS">
      <ProjectBackLink />

      <div className="max-w-3xl">
        {!heroHidden &&
          !embedUrl &&
          (project.videoUrl ? (
            <a
              href={project.videoUrl === "#" ? undefined : project.videoUrl}
              target={project.videoUrl === "#" ? undefined : "_blank"}
              rel="noreferrer"
              className="group relative block"
              aria-label={`Watch ${project.name} video`}
            >
              <ImagePlaceholder
                label={`${project.name} - video`}
                className="aspect-video"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-black/30 transition-transform group-hover:scale-105">
                  <PlayIcon className="h-6 w-6 translate-x-0.5" />
                </span>
              </span>
            </a>
          ) : (
            <ImagePlaceholder label={project.name} className="aspect-video" />
          ))}

        <div className={heroHidden || embedUrl ? "" : "mt-8"}>
          <PageHeading eyebrow="Projects">{project.name}</PageHeading>
        </div>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2 md:justify-start">
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        {project.repoUrls ? (
          <div className="mt-4 flex flex-wrap justify-end gap-x-4 gap-y-1.5 md:justify-start">
            {project.repoUrls.map((repo) => (
              <a
                key={repo.url}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-soft transition-colors hover:text-accent"
              >
                <GithubIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {repo.label}
              </a>
            ))}
          </div>
        ) : (
          project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent-soft transition-colors hover:text-accent"
            >
              <GithubIcon className="h-3.5 w-3.5" aria-hidden="true" />
              View source
            </a>
          )
        )}

        {embedUrl && (
          <div className="mt-8">
            <VideoEmbed src={embedUrl} title={`${project.name} - video`} />
          </div>
        )}

        {CUSTOM_BREAKDOWNS[project.slug] ? (
          CUSTOM_BREAKDOWNS[project.slug]()
        ) : (
          <div className="mt-14 flex flex-col gap-14">
            {project.details.map((block, i) => (
              <div
                key={block.title}
                className={`flex flex-col items-center gap-6 md:gap-10 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                <ImagePlaceholder
                  label={block.title}
                  className="aspect-[4/3] w-full md:w-1/2"
                />
                <div className="md:w-1/2">
                  <h3 className="text-lg font-semibold text-ink">
                    {block.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {block.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cycles through the full list (wrapping at both ends) rather
            than just linking back to /projects — lets someone browse
            the whole set without leaving the detail view each time. */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href={`/projects/${prevProject.slug}`}
            className="group flex flex-col items-start gap-1 rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">
              <ArrowLeftIcon
                className="h-3 w-3 transition-transform duration-150 group-hover:-translate-x-1"
                aria-hidden="true"
              />
              Previous
            </span>
            <span className="line-clamp-1 text-sm font-semibold text-ink transition-colors group-hover:text-accent-soft">
              {prevProject.name}
            </span>
          </Link>
          <Link
            href={`/projects/${nextProject.slug}`}
            className="group flex flex-col items-end gap-1 rounded-2xl border border-line bg-card-tint p-4 text-right backdrop-blur-[6px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">
              Next
              <ArrowRightIcon
                className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
            <span className="line-clamp-1 text-sm font-semibold text-ink transition-colors group-hover:text-accent-soft">
              {nextProject.name}
            </span>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
