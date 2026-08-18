import type { Metadata } from "next";
import { education } from "@/lib/data/education";
import { AcademicsPageClient } from "./academics-client";

export const metadata: Metadata = {
  title: "Academics",
  description: `${education.degree} at ${education.school}. ${education.overview}`,
};

export default function AcademicsPage() {
  return <AcademicsPageClient />;
}
