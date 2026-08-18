import type { Metadata } from "next";
import { SkillsPageClient } from "./skills-client";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Languages, front-end and back-end frameworks, databases, cloud, AI & ML, and testing tools, mapped as an interactive graph.",
};

export default function SkillsPage() {
  return <SkillsPageClient />;
}
