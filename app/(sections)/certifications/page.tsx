import type { Metadata } from "next";
import { CertificationsPageClient } from "./certifications-client";

export const metadata: Metadata = {
  title: "Certifications",
  description:
    "Proctored certifications and course completions from Google, HackerRank, DataCamp, LinkedIn, Pluralsight, and more.",
};

export default function CertificationsPage() {
  return <CertificationsPageClient />;
}
