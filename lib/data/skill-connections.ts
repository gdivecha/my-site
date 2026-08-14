import { experiences } from "./experience";
import { projects } from "./projects";
import { skillCategories } from "./skills";

export type SkillEdge = {
  source: string;
  target: string;
  /** How many actual projects/roles used both skills together. */
  weight: number;
};

export type CategoryEdge = {
  source: string;
  target: string;
  /** How many real skill-to-skill edges cross between these two
   * categories — e.g. React (frontend) real-connected to Node.js
   * (backend) counts once toward frontend↔backend. Zero for a bridge
   * edge (see below), which carries no such count. */
  weight: number;
  /** False only for a bridge edge — added when a category (Testing & QA,
   * as of this data) has zero real cross-category connections of its
   * own, so it would otherwise hang off the root with nothing relating
   * it to the rest of the graph. Bridges to whichever other category is
   * itself the most cross-connected, on the reasoning that the
   * best-connected category is the safest generic "this probably relates
   * somewhat" guess — not a specific claim the way a real edge is. */
  real: boolean;
};

// Project/experience tags are written for humans, not matched 1:1 against
// the skill catalog's names — these are the couple of spots where they
// diverge purely on spelling.
const TAG_TO_SKILL_NAME: Record<string, string> = {
  Tailwind: "Tailwind CSS",
  "React.js": "React",
};

function tagsToSkillNames(tags: string[], knownSkillNames: Set<string>): string[] {
  const mapped = tags.map((tag) => TAG_TO_SKILL_NAME[tag] ?? tag);
  return Array.from(new Set(mapped.filter((name) => knownSkillNames.has(name))));
}

function engineeringCategories() {
  return skillCategories.filter((c) => c.group === "engineering");
}

/** Real skill-to-skill connections only: two skills that were both tagged
 * on the same actual project or role. Nothing fabricated, and no
 * same-category fallback here anymore — once category nodes sit in the
 * graph (see the page component), every skill is already connected via
 * its own category, so this list only needs to carry genuine signal. */
export function buildSkillConnections(): SkillEdge[] {
  const knownSkillNames = new Set(
    engineeringCategories().flatMap((c) => c.skills.map((s) => s.name))
  );

  const weights = new Map<string, number>();
  function addCoOccurrences(tags: string[]) {
    const names = tagsToSkillNames(tags, knownSkillNames);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const key = [names[i], names[j]].sort().join("|||");
        weights.set(key, (weights.get(key) ?? 0) + 1);
      }
    }
  }
  projects.forEach((p) => addCoOccurrences(p.tags));
  experiences.forEach((e) => addCoOccurrences(e.tags));

  return Array.from(weights.entries()).map(([key, weight]) => {
    const [source, target] = key.split("|||");
    return { source, target, weight };
  });
}

/** How categories connect to each other: category A links to category B
 * once for every real skill-edge that crosses between a skill A houses
 * and a skill B houses — e.g. Front-end↔Back-end is weighted by however
 * many real project/role pairings actually crossed that boundary. Every
 * category is guaranteed at least one such edge (see the bridge step at
 * the end) so nothing reads as a dead end beyond its root spoke. */
export function buildCategoryConnections(skillEdges: SkillEdge[]): CategoryEdge[] {
  const categories = engineeringCategories();
  const categoryOf = new Map<string, string>();
  categories.forEach((c) => {
    c.skills.forEach((s) => categoryOf.set(s.name, c.id));
  });

  const weights = new Map<string, number>();
  for (const edge of skillEdges) {
    const catA = categoryOf.get(edge.source);
    const catB = categoryOf.get(edge.target);
    if (!catA || !catB || catA === catB) continue;
    const key = [catA, catB].sort().join("|||");
    weights.set(key, (weights.get(key) ?? 0) + edge.weight);
  }

  const edges: CategoryEdge[] = Array.from(weights.entries()).map(([key, weight]) => {
    const [source, target] = key.split("|||");
    return { source, target, weight, real: true };
  });

  const degree = new Map<string, number>();
  categories.forEach((c) => degree.set(c.id, 0));
  edges.forEach((e) => {
    degree.set(e.source, (degree.get(e.source) ?? 0) + e.weight);
    degree.set(e.target, (degree.get(e.target) ?? 0) + e.weight);
  });
  const connected = new Set(edges.flatMap((e) => [e.source, e.target]));
  const hub = categories
    .map((c) => c.id)
    .sort((a, b) => (degree.get(b) ?? 0) - (degree.get(a) ?? 0))[0];

  for (const category of categories) {
    if (category.id === hub || connected.has(category.id)) continue;
    edges.push({ source: category.id, target: hub, weight: 0, real: false });
  }

  return edges;
}
