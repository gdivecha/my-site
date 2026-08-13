import { navItems } from "./data/nav";
import { skillCategories } from "./data/skills";
import { experiences } from "./data/experience";
import { projects } from "./data/projects";
import { recommendations, previewQuotes } from "./data/recommendations";

export type SearchResult = {
  /** Stable, unique across the whole index — used as the React key, since
   * `label` alone can repeat (e.g. two internships with the same role
   * title at the same company). */
  id: string;
  label: string;
  description?: string;
  href: string;
  group: string;
  /** Extra text matched against a query but never shown in the UI — lets a
   * search surface a result whose match only lives inside a collapsed
   * accordion/expander (e.g. an experience's "challenges" answer, a
   * recommender's quote) without the user ever having opened it. */
  keywords?: string;
};

const pageResults: SearchResult[] = navItems.map((item) => ({
  id: `page-${item.href}`,
  label: item.label,
  href: item.href,
  group: "Pages",
  keywords:
    item.href === "/recommendations"
      ? previewQuotes.map((q) => q.quote).join(" ")
      : undefined,
}));

const skillResults: SearchResult[] = skillCategories
  .filter((category) => category.group === "engineering")
  .flatMap((category) =>
    category.skills.map((skill) => ({
      id: `skill-${category.id}-${skill.name}`,
      label: skill.name,
      description: category.label,
      href: "/skills",
      group: "Skills",
    }))
  );

const experienceResults: SearchResult[] = experiences
  .filter((experience) => experience.type === "internship")
  .map((experience) => ({
    id: `experience-${experience.id}`,
    label: `${experience.role} · ${experience.company}`,
    description: experience.team,
    href: "/experience",
    group: "Experience",
    // Matches even while the card's "View details" section is collapsed.
    keywords: [
      ...experience.summary,
      experience.details?.challenges,
      experience.details?.growth,
      ...experience.tags,
    ]
      .filter(Boolean)
      .join(" "),
  }));

const projectResults: SearchResult[] = projects.map((project) => ({
  id: `project-${project.slug}`,
  label: project.name,
  description: project.description,
  href: `/projects/${project.slug}`,
  group: "Projects",
  keywords: [
    ...project.tags,
    ...project.details.flatMap((block) => [block.title, block.text]),
  ].join(" "),
}));

const recommendationResults: SearchResult[] = Array.from(
  recommendations.reduce((map, rec) => {
    if (!map.has(rec.company)) map.set(rec.company, []);
    map.get(rec.company)!.push(rec);
    return map;
  }, new Map<string, typeof recommendations>())
).map(([company, recs]) => ({
  id: `recommendation-${company}`,
  label: company,
  description: `${recs.length} recommendation${recs.length === 1 ? "" : "s"}`,
  href: "/recommendations",
  group: "Recommendations",
  // Matches recommender names, titles, and full quote text even though
  // "Interested in reading more?" is collapsed by default.
  keywords: recs
    .flatMap((rec) => [
      rec.recommenderName,
      rec.recommenderTitle,
      rec.role,
      rec.term,
      rec.quote,
    ])
    .join(" "),
}));

// Static index — every source is already loaded at build time, no need to
// rebuild this on every search.
export const searchIndex: SearchResult[] = [
  ...pageResults,
  ...projectResults,
  ...skillResults,
  ...experienceResults,
  ...recommendationResults,
];
