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
      className="group block rounded-2xl border border-line bg-card-tint p-6 md:text-left backdrop-blur-[6px] transition-colors hover:border-accent/40 hover:bg-card-tint-hover"
    >
      {/* justify-end (mobile) — the title and date each wrap onto their
          own line on a narrow phone, and a lone item on a
          justify-between line sits at flex-start (left) regardless of
          text-align, which only affects text within a box, not the
          box's own position. Desktop unchanged (md:justify-between,
          where both fit on one shared line). */}
      <div className="flex flex-wrap items-baseline justify-end gap-x-4 gap-y-1 md:justify-between">
        <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-accent-soft">
          {experience.role}
          {" "}
          <ArrowRightIcon className="ml-0.5 hidden h-3.5 w-3.5 -translate-x-1 align-middle opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 md:inline" />
        </h3>
        <span className="shrink-0 text-xs text-ink-faint">
          {experience.dateRange}
          {duration ? ` · ${duration}` : ""}
        </span>
      </div>

      {/* flex-col on mobile, not the row layout desktop uses — squeezing
          the logo beside the text there left only a narrow column for the
          description, which wrapped into many short, awkward lines while
          the logo's own column sat mostly empty below it (both problems
          from the same cause: the logo eating into text width instead of
          getting its own row). Stacking gives the description the card's
          full width to work with, and self-end (only the logo needs it —
          the text block below it already fills the row by default) keeps
          the logo right-anchored above it, matching the page's usual
          mobile media placement. Desktop is untouched (md:flex-row). */}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-start md:gap-5">
        {experience.logoSrc ? (
          <div className="relative h-24 w-24 shrink-0 self-end overflow-hidden rounded-xl border border-line sm:h-28 sm:w-28 md:self-auto">
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
            className="h-24 w-24 shrink-0 self-end sm:h-28 sm:w-28 md:self-auto"
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

      <div className="mt-5 flex flex-wrap justify-end gap-2 md:justify-start">
        {experience.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </Link>
  );
}
