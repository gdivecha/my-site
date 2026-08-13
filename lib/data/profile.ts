export type Social = {
  label: "GitHub" | "LinkedIn" | "Instagram";
  href: string;
};

export const profile = {
  name: "Gaurav Divecha",
  roles: ["Software Engineer", 
    "Artist", 
    // "Content Creator"
  ],
  tagline:
    "I build full-stack products, make things that look good doing it, and share the process along the way.",
  bio: [
    "I'm a full-stack software engineer with 2+ years of internship experience across Amazon and Dayforce, specializing in scalable cloud infrastructure, real-time systems, and user-focused frontend design.",
    "I work across the entire stack, from AWS backend services and database optimization to React frontends and performance dashboards, with a strong focus on shipping features that work well and feel intentional.",
    "My background spans AI/ML integration, automated testing, CI/CD optimization, and design systems, giving me a holistic view of how engineering decisions impact both product and user experience.",
  ],
  education: "Toronto Metropolitan University",
  location: "Greater Toronto Area, ON, Canada",
  // TODO: replace with real profile URLs
  socials: [
    { label: "GitHub", href: "https://github.com/gdivecha" },
    { label: "LinkedIn", href: "#" },
    { label: "Instagram", href: "#" },
  ] satisfies Social[],
};
