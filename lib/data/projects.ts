export type ProjectCategory = "full-stack" | "backend" | "hackathon";

export type ProjectDetailBlock = {
  title: string;
  text: string;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  videoUrl?: string;
  details: ProjectDetailBlock[];
};

// Placeholder content — swap in real projects, descriptions, and media.
export const projects: Project[] = [
  {
    id: "1",
    slug: "shelfie",
    name: "Shelfie",
    description:
      "A full-stack app for tracking a personal library and sharing reading lists with friends.",
    category: "full-stack",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind"],
    videoUrl: "#",
    details: [
      {
        title: "The problem",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the problem this project set out to solve.",
      },
      {
        title: "The approach",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the technical approach and key decisions.",
      },
      {
        title: "The outcome",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the result, metrics, or what shipped.",
      },
    ],
  },
  {
    id: "2",
    slug: "queueup",
    name: "QueueUp",
    description:
      "A REST API and worker system for fair, rate-limited task scheduling across tenants.",
    category: "backend",
    tags: ["Node.js", "Redis", "Docker", "AWS"],
    details: [
      {
        title: "The problem",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the problem this project set out to solve.",
      },
      {
        title: "The approach",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the technical approach and key decisions.",
      },
      {
        title: "The outcome",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the result, metrics, or what shipped.",
      },
    ],
  },
  {
    id: "3",
    slug: "hackthenorth-2024",
    name: "SousChef",
    description:
      "Built in 36 hours — an AI recipe assistant that plans meals from what's already in your fridge.",
    category: "hackathon",
    tags: ["Python", "OpenAI API", "React", "Hackathon"],
    videoUrl: "#",
    details: [
      {
        title: "The problem",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the problem this project set out to solve.",
      },
      {
        title: "The approach",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the technical approach and key decisions.",
      },
      {
        title: "The outcome",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the result — awards, demos, or next steps.",
      },
    ],
  },
  {
    id: "4",
    slug: "pulse",
    name: "Pulse",
    description:
      "A full-stack analytics dashboard for indie developers to track product usage in real time.",
    category: "full-stack",
    tags: ["React", "GraphQL", "MongoDB", "Vercel"],
    details: [
      {
        title: "The problem",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the problem this project set out to solve.",
      },
      {
        title: "The approach",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the technical approach and key decisions.",
      },
      {
        title: "The outcome",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the result, metrics, or what shipped.",
      },
    ],
  },
  {
    id: "5",
    slug: "ledger-lite",
    name: "Ledger Lite",
    description:
      "A lightweight double-entry bookkeeping API built for small studio teams.",
    category: "backend",
    tags: ["C#", ".NET", "SQL Server", "Azure"],
    details: [
      {
        title: "The problem",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the problem this project set out to solve.",
      },
      {
        title: "The approach",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the technical approach and key decisions.",
      },
      {
        title: "The outcome",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the result, metrics, or what shipped.",
      },
    ],
  },
  {
    id: "6",
    slug: "hackwestern-2023",
    name: "Wayfound",
    description:
      "Built in 24 hours — an accessible indoor-navigation app for large campus buildings.",
    category: "hackathon",
    tags: ["React Native", "TypeScript", "Hackathon"],
    details: [
      {
        title: "The problem",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the problem this project set out to solve.",
      },
      {
        title: "The approach",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the technical approach and key decisions.",
      },
      {
        title: "The outcome",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy describing the result — awards, demos, or next steps.",
      },
    ],
  },
];
