import Link from "next/link";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { ArrowRightIcon } from "@/components/icons";
import type { Project } from "@/lib/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card-tint backdrop-blur-[6px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
    >
      <ImagePlaceholder
        label={project.name}
        bare
        className="aspect-video border-b border-line"
      />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="inline-flex items-center gap-1.5 text-base font-semibold text-ink transition-colors group-hover:text-accent-soft">
          {project.name}
          <ArrowRightIcon className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
          {project.description}
        </p>
      </div>
    </Link>
  );
}
