import type { Metadata } from "next";
import { RecommendationsPageClient } from "./recommendations-client";

export const metadata: Metadata = {
  title: "Recommendations",
  description:
    "What managers and coworkers at Amazon, Dayforce, and Prestar have said about working with me.",
};

export default function RecommendationsPage() {
  return <RecommendationsPageClient />;
}
