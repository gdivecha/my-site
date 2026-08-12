export type ExperienceType = "full-time" | "internship" | "freelance";

export type Experience = {
  id: string;
  company: string;
  role: string;
  team?: string;
  dateRange: string;
  type: ExperienceType;
  tags: string[];
  summary: string;
  details?: {
    challenges: string;
    growth: string;
  };
};

// Placeholder content — swap in real roles, dates, and copy.
export const experiences: Experience[] = [
  {
    id: "acme-technologies",
    company: "Acme Technologies",
    role: "Software Engineer",
    team: "Platform Team",
    dateRange: "2026 — Present",
    type: "full-time",
    tags: ["TypeScript", "React", "AWS", "PostgreSQL"],
    summary:
      "Placeholder full-time role — replace with your current position, team, and a one-line summary of scope.",
    details: {
      challenges:
        "Placeholder: describe a real technical or organizational challenge you navigated here.",
      growth:
        "Placeholder: describe how this role shaped your skills or career direction.",
    },
  },
  {
    id: "amazon",
    company: "Amazon",
    role: "Software Development Engineer Intern",
    team: "AWS",
    dateRange: "Jun '25 - Aug '25",
    type: "internship",
    tags: ["Java", "AWS", "DynamoDB", "Microservices"],
    summary:
      "Placeholder internship summary — a sentence or two on the team and what you built.",
    details: {
      challenges:
        "Placeholder: describe a challenge — scale, ambiguity, a new stack — and how you worked through it.",
      growth:
        "Placeholder: describe what this internship taught you about large-scale engineering or your own goals.",
    },
  },
  {
    id: "dayforce",
    company: "Dayforce",
    role: "Software Engineer Intern",
    team: "Payroll Engineering",
    dateRange: "Sep '23 - Dec '23",
    type: "internship",
    tags: ["C#", ".NET", "SQL", "Azure"],
    summary:
      "Placeholder internship summary — a sentence or two on the team and what you built.",
    details: {
      challenges:
        "Placeholder: describe a real challenge from this term and how it was resolved.",
      growth:
        "Placeholder: describe how this internship shaped your engineering interests.",
    },
  },
  {
    id: "ryerson-hyperloop",
    company: "Ryerson International Hyperloop",
    role: "Software & Firmware Engineer",
    team: "Controls Subteam",
    dateRange: "2022 — 2023",
    type: "freelance",
    tags: ["C++", "Embedded Systems", "Python", "CAN Bus"],
    summary:
      "Placeholder: student engineering team building a hyperloop pod prototype for international competition.",
    details: {
      challenges:
        "Placeholder: describe a hardware/software integration challenge under competition deadlines.",
      growth:
        "Placeholder: describe how leading or contributing to this team shaped your engineering identity.",
    },
  },
  {
    id: "independent-creator",
    company: "Independent",
    role: "Content Creator",
    dateRange: "2021 — Present",
    type: "freelance",
    tags: ["Video Editing", "Illustration", "Social Strategy"],
    summary:
      "Placeholder: ongoing freelance content work — video, illustration, and social media management for clients.",
    details: {
      challenges:
        "Placeholder: describe a creative or logistical challenge from freelance work.",
      growth:
        "Placeholder: describe how running creative work independently shaped your taste and process.",
    },
  },
];
