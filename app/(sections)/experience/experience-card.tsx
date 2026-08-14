import Image from "next/image";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Tag } from "@/components/Pill";
import { durationText, type Experience } from "@/lib/data/experience";

export function ExperienceCard({ experience }: { experience: Experience }) {
  const duration = durationText(experience);

  return (
    <Link
      href={`/experience/${experience.id}`}
      className="block rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[3.8px] transition-colors hover:bg-card-tint-hover"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-semibold text-ink">
          {experience.role}
        </h3>
        <span className="shrink-0 text-xs text-ink-faint">
          {experience.dateRange}
          {duration ? ` · ${duration}` : ""}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-5">
        {experience.logoSrc ? (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line sm:h-28 sm:w-28">
            <Image
              src={experience.logoSrc}
              alt={`${experience.company} logo`}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
        ) : (
          <ImagePlaceholder
            label={experience.company}
            className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
          />
        )}
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-medium sm:text-base"
            style={{ color: "#616297" }}
          >
            {experience.company}
            {experience.team ? `, ${experience.team}` : ""}
          </p>

          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {experience.summary.join(" ")}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {experience.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </Link>
  );
}
