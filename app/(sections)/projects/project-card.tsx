import Link from "next/link";
import { ArrowRightIcon, DatabaseIcon, GlobeIcon, WrenchIcon } from "@/components/icons";
import { Tag } from "@/components/Pill";
import type { Project, ProjectCategory } from "@/lib/data/projects";

const CATEGORY_ICONS: Record<ProjectCategory, typeof GlobeIcon> = {
  "full-stack": GlobeIcon,
  backend: DatabaseIcon,
  hardware: WrenchIcon,
};

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  "full-stack": "Full-Stack",
  backend: "Backend",
  hardware: "Hardware",
};

/** Surfaces the project's real metadata (category, scale, tech stack)
 * directly on the card instead of a placeholder preview image nothing
 * ever filled in - "scale" in particular was otherwise invisible outside
 * the sort dropdown, so this gives it a visual meaning here too. */
export function ProjectCard({ project }: { project: Project }) {
  const CategoryIcon = CATEGORY_ICONS[project.category];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-ink-faint">
          <CategoryIcon className="h-3.5 w-3.5 text-accent-soft" aria-hidden="true" />
          {CATEGORY_LABELS[project.category]}
        </span>
        <span
          className="flex items-center gap-1"
          role="img"
          aria-label={`Scale: ${project.scale} out of 5`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i < project.scale ? "bg-accent-soft" : "bg-line"
              }`}
              aria-hidden="true"
            />
          ))}
        </span>
      </div>

      <h3 className="mt-3 inline-flex items-center gap-1.5 text-base font-semibold text-ink transition-colors group-hover:text-accent-soft">
        {project.name}
        <ArrowRightIcon className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
        {project.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </Link>
  );
}
