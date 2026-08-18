import type { Metadata } from "next";
import { ProjectsPageClient } from "./projects-client";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Full-stack, backend, and hardware projects, from a 5-node distributed key-value store to a facial recognition attendance platform.",
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
