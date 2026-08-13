import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { skillCategories } from "@/lib/data/skills";
import { SkillRow } from "./skill-row";

export default function SkillsPage() {
  // Content-creation categories are hidden for now — swap "engineering" for
  // "content" (or bring back the toggle) to show them again.
  const categories = skillCategories.filter((c) => c.group === "engineering");

  return (
    <PageShell watermark="SKILLS">
      <PageHeading eyebrow="Skills">My Expertise</PageHeading>

      <div className="mt-8 flex max-w-2xl flex-col gap-3">
        {categories.map((category) => (
          <SkillRow key={category.id} category={category} />
        ))}
      </div>
    </PageShell>
  );
}
