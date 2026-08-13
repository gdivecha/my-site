export type Social = {
  label: "GitHub" | "LinkedIn" | "Devpost";
  href: string;
};

export const profile = {
  name: "Gaurav Divecha",
  roles: ["Software Engineer", 
    "Artist", 
    // "Content Creator"
  ],
  tagline:
    "Software engineer by trade, artist by nature - I care as much about how something feels as how it performs.",
  bio: [
    "I'm a full-stack software engineer with 2+ years of internship experience across Amazon and Dayforce, specializing in scalable cloud infrastructure, real-time systems, and user-focused frontend design.",
    "I work across the entire stack, from AWS backend services and database optimization to React frontends and performance dashboards, with a strong focus on shipping features that work well and feel intentional.",
    "Outside of engineering, I spend time on visual art and design - a habit that shows up in my engineering work too, from the design systems I build to how much I care about interfaces feeling considered rather than just functional.",
  ],
  education: "Toronto Metropolitan University",
  location: "Greater Toronto Area, ON, Canada",
  // TODO: replace with real profile URLs
  socials: [
    { label: "GitHub", href: "https://github.com/gdivecha" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/gauravcdivecha" },
    { label: "Devpost", href: "https://devpost.com/gdivecha" },
  ] satisfies Social[],
};
