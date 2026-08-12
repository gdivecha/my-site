export type SkillTag = {
  name: string;
  abbr: string;
};

export type SkillCategory = {
  id: string;
  label: string;
  group: "engineering" | "content";
  skills: SkillTag[];
};

export const skillCategories: SkillCategory[] = [
  {
    id: "languages",
    label: "Languages",
    group: "engineering",
    skills: [
      { name: "C", abbr: "C" },
      { name: "C#", abbr: "C#" },
      { name: "Python", abbr: "Py" },
      { name: "Java", abbr: "Jv" },
      { name: "JavaScript", abbr: "JS" },
      { name: "TypeScript", abbr: "TS" },
    ],
  },
  {
    id: "backend",
    label: "Back-end",
    group: "engineering",
    skills: [
      { name: "Node.js", abbr: "Nd" },
      { name: "Express", abbr: "Ex" },
      { name: ".NET", abbr: ".N" },
      { name: "GraphQL", abbr: "GQ" },
      { name: "REST APIs", abbr: "API" },
    ],
  },
  {
    id: "frontend",
    label: "Front-end",
    group: "engineering",
    skills: [
      { name: "React", abbr: "Re" },
      { name: "Next.js", abbr: "Nx" },
      { name: "Tailwind CSS", abbr: "Tw" },
      { name: "HTML5", abbr: "H5" },
      { name: "CSS3", abbr: "C3" },
    ],
  },
  {
    id: "database",
    label: "Database",
    group: "engineering",
    skills: [
      { name: "PostgreSQL", abbr: "Pg" },
      { name: "MongoDB", abbr: "Mo" },
      { name: "MySQL", abbr: "My" },
      { name: "Redis", abbr: "Rd" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud Computing",
    group: "engineering",
    skills: [
      { name: "AWS", abbr: "AW" },
      { name: "Azure", abbr: "Az" },
      { name: "Docker", abbr: "Dk" },
      { name: "Vercel", abbr: "Vc" },
    ],
  },
  {
    id: "ai-ml",
    label: "AI & ML",
    group: "engineering",
    skills: [
      { name: "PyTorch", abbr: "PT" },
      { name: "TensorFlow", abbr: "TF" },
      { name: "OpenAI API", abbr: "AI" },
      { name: "scikit-learn", abbr: "Sk" },
    ],
  },
  {
    id: "testing",
    label: "Testing & QA",
    group: "engineering",
    skills: [
      { name: "Jest", abbr: "Je" },
      { name: "Cypress", abbr: "Cy" },
      { name: "Postman", abbr: "Po" },
      { name: "JUnit", abbr: "JU" },
    ],
  },
  {
    id: "other-tools",
    label: "Other Tools",
    group: "engineering",
    skills: [
      { name: "Git", abbr: "Gt" },
      { name: "Figma", abbr: "Fg" },
      { name: "Jira", abbr: "Ji" },
      { name: "Linux", abbr: "Lx" },
    ],
  },
  {
    id: "video-editing",
    label: "Video Editing",
    group: "content",
    skills: [
      { name: "Premiere Pro", abbr: "Pr" },
      { name: "After Effects", abbr: "Ae" },
      { name: "DaVinci Resolve", abbr: "Dv" },
    ],
  },
  {
    id: "graphic-design",
    label: "Graphic Design",
    group: "content",
    skills: [
      { name: "Photoshop", abbr: "Ps" },
      { name: "Illustrator", abbr: "Ai" },
      { name: "Figma", abbr: "Fg" },
    ],
  },
  {
    id: "social-media",
    label: "Social Media Management",
    group: "content",
    skills: [
      { name: "Instagram", abbr: "Ig" },
      { name: "TikTok", abbr: "Tt" },
      { name: "YouTube Studio", abbr: "Yt" },
      { name: "Analytics", abbr: "An" },
    ],
  },
];
