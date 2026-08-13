import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { experiences } from "@/lib/data/experience";
import { ExperienceCard } from "./experience-card";

export default function ExperiencePage() {
  // Full-time and freelance filters are hidden for now — this always shows
  // internships. Bring back the filter row to show the other types again.
  const filtered = experiences.filter((e) => e.type === "internship");

  return (
    <PageShell watermark="EXPERIENCE">
      <PageHeading eyebrow="Experience">Professional Experience</PageHeading>

      <div className="mt-8 flex max-w-2xl flex-col gap-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-ink-faint">
            No entries in this category yet.
          </p>
        ) : (
          filtered.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))
        )}
      </div>
    </PageShell>
  );
}
