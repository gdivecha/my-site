export type Social = {
  label: "GitHub" | "LinkedIn" | "Instagram";
  href: string;
};

export const profile = {
  name: "Gaurav Divecha",
  roles: ["Software Engineer", "Artist", "Content Creator"],
  tagline:
    "I build full-stack products, make things that look good doing it, and share the process along the way.",
  bio: [
    "I'm a software engineer who splits time between shipping full-stack products and making things that are, honestly, just fun to look at — from UI polish to short-form video.",
    "I care about the details most people skip: the animation that makes a click feel right, the empty state that isn't sad, the README someone actually reads. That instinct comes from spending as much time behind a camera and a Wacom tablet as behind a keyboard.",
    "Lately I've been deep in TypeScript, React, and cloud infrastructure by day, and editing, illustration, and content strategy by night. This site is where those two halves meet.",
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
