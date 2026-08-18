import type { MetadataRoute } from "next";
import { experiences } from "@/lib/data/experience";
import { projects } from "@/lib/data/projects";
import { siteUrl } from "@/lib/site-config";

// The same 9 routes linked from the dial nav (see lib/data/nav.ts) — not
// "bonus"/"open-source", which are unlinked placeholder stubs with no real
// content yet; indexing thin/near-empty pages does more harm than good for
// SEO, so they're deliberately left out until they have something to show.
const STATIC_ROUTES = [
  "/home",
  "/skills",
  "/experience",
  "/projects",
  "/academics",
  "/portfolio",
  "/certifications",
  "/recommendations",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
  }));

  const experienceEntries: MetadataRoute.Sitemap = experiences.map((e) => ({
    url: `${siteUrl}/experience/${e.id}`,
  }));

  return [...staticEntries, ...projectEntries, ...experienceEntries];
}
