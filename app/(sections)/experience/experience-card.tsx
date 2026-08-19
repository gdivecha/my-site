import Image from "next/image";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Tag } from "@/components/Pill";
import { ArrowRightIcon } from "@/components/icons";
import { durationText, type Experience } from "@/lib/data/experience";

export function ExperienceCard({ experience }: { experience: Experience }) {
  const duration = durationText(experience);

  return (
    <Link
      href={`/experience/${experience.id}`}
      className="group block rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[6px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-accent-soft">
          {experience.role}
          {" "}
          <ArrowRightIcon className="ml-0.5 inline h-3.5 w-3.5 -translate-x-1 align-middle opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
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
              // Tiny local files, same reasoning as IssuerBadge's logos
              // (app/(sections)/certifications/issuer-badge.tsx): lazy
              // loading buys nothing for a file this small and just means
              // a fast scroll down this list can outrun the load trigger,
              // leaving a card's logo blank for a moment.
              loading="eager"
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
