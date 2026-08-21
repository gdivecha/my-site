import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Tag } from "@/components/Pill";
import { ArrowLeftIcon } from "@/components/icons";
import { durationText, experiences } from "@/lib/data/experience";

export function generateStaticParams() {
  return experiences.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const experience = experiences.find((e) => e.id === id);
  if (!experience) return { title: "Experience not found" };

  const title = `${experience.role} at ${experience.company}`;
  const description = experience.summary[0];
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `/experience/${experience.id}` },
  };
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experience = experiences.find((e) => e.id === id);
  if (!experience) notFound();

  const duration = durationText(experience);

  return (
    <PageShell watermark="EXPERIENCE">
      <Link
        href="/experience"
        className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink-soft"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Experience
      </Link>

      <div className="mt-6 max-w-3xl">
        {/* order-2, not DOM order — on mobile the logo sits to the right
            of the role/company text (matching the site's usual mobile
            right-anchored-media convention, e.g. Home's photo-right
            layout), desktop keeps the original logo-left order. */}
        <div className="flex items-start gap-5">
          {experience.logoSrc ? (
            <div className="relative order-2 h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line sm:h-28 sm:w-28 md:order-none">
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
              className="order-2 h-24 w-24 shrink-0 sm:h-28 sm:w-28 md:order-none"
            />
          )}

          <div className="order-1 min-w-0 md:order-none">
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {experience.role}
            </h1>
            <p
              className="mt-1 text-sm font-medium sm:text-base"
              style={{ color: "#616297" }}
            >
              {experience.company}
              {experience.team ? `, ${experience.team}` : ""}
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              {experience.dateRange}
              {duration ? ` · ${duration}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2 md:justify-start">
          {experience.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        <div className="mt-6 space-y-3 text-[15px] leading-relaxed text-ink-soft">
          {experience.summary.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {experience.details && (
          <div className="mt-14 flex flex-col gap-10">
            <div>
              <h3 className="text-lg font-semibold text-ink">
                What challenges did I face while working here?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {experience.details.challenges}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">
                How did this role shape my career aspirations or personal
                goals?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {experience.details.growth}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
