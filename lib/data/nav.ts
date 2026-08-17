export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/home" },
  { label: "Skills", href: "/skills" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Academics", href: "/academics" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Recommendations", href: "/recommendations" },
  // Hidden for now — pages still exist, just not linked from the dial.
  // Re-add here to bring them back.
  // { label: "Open Source", href: "/open-source" },
  // { label: "Certifications", href: "/certifications" },
  // { label: "Bonus", href: "/bonus" },
  { label: "Contact", href: "/contact" },
  { label: "Loading Demo", href: "/loading-demo" },
];
