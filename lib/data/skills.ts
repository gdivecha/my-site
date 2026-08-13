export type SkillTag = {
  name: string;
  abbr: string;
  /** Key into `iconMap` or `extraIconMap` in `components/TechIcon.tsx` (a simple-icons brand mark, or a devicon one for brands simple-icons has dropped). Omit for skills with no available brand logo — they fall back to a colored hex-badge using `abbr` + `color`. */
  icon?: string;
  /** Fallback hex-badge background (used when `icon` is absent), or an override when the brand's own icon color is pure black/white — see `monochrome`. */
  color?: string;
  /** True when the brand's official icon color is near-black/white and would vanish against a same-tone tile — render it in the current text color instead of its own hex. */
  monochrome?: boolean;
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
      { name: "C", abbr: "C", icon: "C" },
      { name: "C#", abbr: "C#", icon: "Csharp", color: "#9B4F96" },
      { name: "Python", abbr: "Py", icon: "Python" },
      { name: "Java", abbr: "Jv", icon: "Java", color: "#E76F00" },
      { name: "JavaScript", abbr: "JS", icon: "Javascript" },
      { name: "TypeScript", abbr: "TS", icon: "Typescript" },
    ],
  },
  {
    id: "backend",
    label: "Back-end",
    group: "engineering",
    skills: [
      { name: "Node.js", abbr: "Nd", icon: "Nodedotjs" },
      { name: ".NET", abbr: ".N", icon: "Dotnet" },
      { name: "REST APIs", abbr: "API", color: "#6D5FE8" },
    ],
  },
  {
    id: "frontend",
    label: "Front-end",
    group: "engineering",
    skills: [
      { name: "React", abbr: "Re", icon: "React" },
      { name: "Next.js", abbr: "Nx", icon: "Nextdotjs", monochrome: true },
      { name: "Tailwind CSS", abbr: "Tw", icon: "Tailwindcss" },
      { name: "HTML5", abbr: "H5", icon: "Html5" },
      { name: "CSS3", abbr: "C3", icon: "Css" },
      { name: "Axios", abbr: "Ax", icon: "Axios" },
      { name: "Material UI", abbr: "MU", icon: "Mui" },
    ],
  },
  {
    id: "database",
    label: "Database",
    group: "engineering",
    skills: [
      { name: "PostgreSQL", abbr: "Pg", icon: "Postgresql" },
      { name: "MongoDB", abbr: "Mo", icon: "Mongodb" },
      { name: "MySQL", abbr: "My", icon: "Mysql" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud Computing",
    group: "engineering",
    skills: [
      { name: "AWS", abbr: "AWS", color: "#FF9900" },
      { name: "Azure", abbr: "Az", icon: "Azure", color: "#0089D6" },
      { name: "Docker", abbr: "Dk", icon: "Docker" },
      { name: "Vercel", abbr: "Vc", icon: "Vercel", monochrome: true },
    ],
  },
  {
    id: "ai-ml",
    label: "AI & ML",
    group: "engineering",
    skills: [
      { name: "OpenAI API", abbr: "AI", color: "#10A37F" },
      { name: "Claude Code", abbr: "CC", icon: "Claudecode" },
      { name: "Cursor", abbr: "Cu", icon: "Cursor", monochrome: true },
    ],
  },
  {
    id: "testing",
    label: "Testing & QA",
    group: "engineering",
    skills: [
      { name: "Jest", abbr: "Je", icon: "Jest" },
      { name: "Mockito", abbr: "Mk", color: "#78A641" },
      { name: "Postman", abbr: "Po", icon: "Postman" },
      { name: "JUnit", abbr: "JU", icon: "Junit5" },
    ],
  },
  {
    id: "other-tools",
    label: "Other Tools",
    group: "engineering",
    skills: [
      { name: "Git", abbr: "Gt", icon: "Git" },
      { name: "Figma", abbr: "Fg", icon: "Figma" },
      { name: "Jira", abbr: "Ji", icon: "Jira" },
      { name: "Linux", abbr: "Lx", icon: "Linux" },
    ],
  },
  {
    id: "video-editing",
    label: "Video Editing",
    group: "content",
    skills: [
      { name: "Premiere Pro", abbr: "Pr", icon: "Premierepro", color: "#00005B" },
      { name: "After Effects", abbr: "Ae", icon: "Aftereffects", color: "#9999FF" },
      { name: "DaVinci Resolve", abbr: "Dv", icon: "Davinciresolve" },
    ],
  },
  {
    id: "graphic-design",
    label: "Graphic Design",
    group: "content",
    skills: [
      { name: "Photoshop", abbr: "Ps", icon: "Photoshop", color: "#31A8FF" },
      { name: "Illustrator", abbr: "Ai", icon: "Illustrator", color: "#FF9A00" },
      { name: "Figma", abbr: "Fg", icon: "Figma" },
    ],
  },
  {
    id: "social-media",
    label: "Social Media Management",
    group: "content",
    skills: [
      { name: "Instagram", abbr: "Ig", icon: "Instagram" },
      { name: "TikTok", abbr: "Tt", icon: "Tiktok", monochrome: true },
      { name: "YouTube Studio", abbr: "Yt", icon: "Youtube" },
      { name: "Analytics", abbr: "An", icon: "Googleanalytics" },
    ],
  },
];
