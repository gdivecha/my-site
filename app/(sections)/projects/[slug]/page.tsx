import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Tag } from "@/components/Pill";
import { ArrowLeftIcon, PlayIcon } from "@/components/icons";
import { projects } from "@/lib/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <PageShell watermark="PROJECTS">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink-soft"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Projects
      </Link>

      <div className="mt-6 max-w-3xl">
        {project.videoUrl ? (
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
        )}

        <h2 className="mt-8 font-display text-3xl font-bold text-ink sm:text-4xl">
          {project.name}
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

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
      </div>
    </PageShell>
  );
}
