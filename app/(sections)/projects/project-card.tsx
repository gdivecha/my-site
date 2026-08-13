import Link from "next/link";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import type { Project } from "@/lib/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card-tint backdrop-blur-[3.8px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
    >
      <ImagePlaceholder
        label={project.name}
        bare
        className="aspect-video border-b border-line"
      />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-accent-soft">
          {project.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
          {project.description}
        </p>
      </div>
    </Link>
  );
}
