export type ExperienceType = "full-time" | "internship" | "freelance";

export type Experience = {
  id: string;
  company: string;
  role: string;
  team?: string;
  dateRange: string;
  /** ISO-ish dates (`YYYY-MM-DD`) used to compute the "N months" shown next
   * to `dateRange` — never hardcoded. Duration is always
   * (end - start, inclusive) + 1 month. Omit `endDate` for an ongoing role
   * ("Present") and it's computed against today's date instead. */
  startDate: string;
  endDate?: string;
  type: ExperienceType;
  /** True when this stint followed an earlier one at the same company —
   * i.e. they asked me back. Used to compute the résumé page's "return
   * offers" stat, never hardcoded there. */
  returnOffer?: boolean;
  tags: string[];
  summary: string[];
  /** Path to a real company logo in `public/`. Falls back to the diagonal-stripe placeholder when absent. */
  logoSrc?: string;
  details?: {
    challenges: string;
    growth: string;
  };
};

// Always computed, never hardcoded — end defaults to today for ongoing
// roles (no endDate set). +1 makes it inclusive of both start and end
// months, matching how e.g. "Jun - Aug" reads as 3 months, not 2. Shared
// by the card (badge) and the detail page (header), rather than each
// re-deriving it.
export function durationText(experience: Experience): string {
  const start = new Date(experience.startDate);
  const end = experience.endDate ? new Date(experience.endDate) : new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;
  const n = Math.max(months, 1);
  return `${n} ${n === 1 ? "month" : "months"}`;
}

export const experiences: Experience[] = [
  // {
  //   id: "acme-technologies",
  //   company: "Acme Technologies",
  //   role: "Software Engineer",
  //   team: "Platform Team",
  //   dateRange: "2026 - Present",
  //   startDate: "2026-01-01", // ongoing — duration is computed live, not hardcoded
  //   type: "full-time",
  //   tags: ["TypeScript", "React", "AWS", "PostgreSQL"],
  //   summary:
  //     "Placeholder full-time role - replace with your current position, team, and a one-line summary of scope.",
  //   details: {
  //     challenges:
  //       "Placeholder: describe a real technical or organizational challenge you navigated here.",
  //     growth:
  //       "Placeholder: describe how this role shaped your skills or career direction.",
  //   },
  // },
  {
    id: "prestar",
    company: "Prestar",
    role: "Software Developer Intern",
    team: "Web Engineering team",
    dateRange: "Oct '25 - Feb '26",
    startDate: "2025-10-01",
    endDate: "2026-02-01",
    type: "internship",
    tags: ["Figma", "Framer"],
    logoSrc: "/logos/prestar.jpg",
    summary: [
      "Built responsive website pages with reusable components and clean interactions across mobile and desktop. Established the technical foundation for seamless backend integration.",
    ],
    details: {
      challenges:
        "Keeping a fully remote, async team aligned on a shared visual language was the hardest part - reference layouts and hover states had to be interpreted consistently without much back-and-forth, so I leaned on tight, well-documented components instead of one-off styling.",
      growth:
        "It sharpened my eye for translating design references into responsive, production-ready UI, and reinforced how much smoother later integration work goes when components are built modular from day one.",
    },
  },
  {
    id: "amazon-fba-inbound",
    company: "Amazon",
    role: "Software Development Engineer Intern",
    team: "SCOT - FBA Inbound Placement Team",
    dateRange: "May '24 - Aug '24",
    startDate: "2024-05-01",
    endDate: "2024-08-01",
    type: "internship",
    returnOffer: true,
    tags: ["AWS", "TypeScript", "Java", "Cloud-Native Architecture"],
    logoSrc: "/logos/amazon.png",
    summary: [
      "Engineered a real-time query system delivering live insights for millions of global shipping decisions. Designed automated alerts that cut issue resolution time and kept operations running at scale.",
    ],
    details: {
      challenges:
        "The trickiest part was designing a scheduling system flexible enough for teams across the globe to configure their own SQL queries without needing to touch infrastructure - getting the AppConfig and CDK setup right so it stayed both safe and self-serve took a few iterations.",
      growth:
        "This internship pushed me to think in terms of systems that other engineers would configure and depend on, not just code I'd run myself, and gave me a much deeper appreciation for observability and alerting at scale.",
    },
  },
  {
    id: "dayforce-performance-fall23",
    company: "Dayforce",
    role: "Software Development Engineer",
    team: "Performance Engineering Team",
    dateRange: "Sep '23 - Dec '23",
    startDate: "2023-09-01",
    endDate: "2023-12-01",
    type: "internship",
    returnOffer: true,
    tags: ["React.js", "C#", "Node.js", "Azure"],
    logoSrc: "/logos/dayforce.png",
    summary: [
      "Built a comparative analytics tool letting engineers analyze 100+ performance snapshots instantly. Automated data retrieval to eliminate manual overhead and accelerate decision-making.",
    ],
    details: {
      challenges:
        "Comparing 100+ historical snapshots at once meant being deliberate about what the UI actually surfaced - too much data and it stopped being useful, so a good chunk of the work was in the data modeling, not just the interface.",
      growth:
        "Working part-time alongside coursework taught me to scope tightly and ship in smaller increments, and deepened my comfort automating data pipelines end-to-end with Node.js and Azure.",
    },
  },
  {
    id: "amazon-fba-transportation",
    company: "Amazon",
    role: "Software Development Engineer Intern",
    team: "SCOT - FBA Transportation Xperience Team",
    dateRange: "May '23 - Aug '23",
    startDate: "2023-05-01",
    endDate: "2023-08-01",
    type: "internship",
    tags: ["React.js", "JavaScript", "CI/CD", "AWS"],
    logoSrc: "/logos/amazon.png",
    summary: [
      "Solved post-Brexit cross-border delays by building a real-time customs tracking console for millions of sellers. Cut development friction massively through automation, multiplying team velocity.",
    ],
    details: {
      challenges:
        "Post-Brexit customs rules kept shifting, so the console had to surface accurate, real-time insight into shipment delays without being brittle to those changes - that meant a lot of time understanding the actual customs workflows before writing any code.",
      growth:
        "It was my first real exposure to how much a CI/CD investment compounds at scale - a 30% pipeline improvement here translated into real, measurable cost savings, which reframed how I think about the value of tooling work.",
    },
  },
  {
    id: "dayforce-performance-winter23",
    company: "Dayforce",
    role: "Software Development Engineer",
    team: "Performance Engineering Team",
    dateRange: "Jan '23 - Apr '23",
    startDate: "2023-01-01",
    endDate: "2023-04-01",
    type: "internship",
    returnOffer: true,
    tags: ["React.js", "JavaScript", "Figma", "Azure"],
    logoSrc: "/logos/dayforce.png",
    summary: [
      "Built a performance dashboard that halved troubleshooting time. Championed design-driven UI improvements for Fortune 500 clients, increasing product adoption and reducing investigation overhead.",
    ],
    details: {
      challenges:
        "Designing for stakeholders as different as Amazon and UPS meant the platform couldn't just work for one team's workflow - I had to validate the UX against a few very different use cases before it actually moved the retention numbers.",
      growth:
        "This term is where I really connected design to outcomes - seeing a UI change tie directly to a 20% retention lift made the case for user-centric design concrete instead of abstract.",
    },
  },
  {
    id: "dayforce-test-engineer",
    company: "Dayforce",
    role: "Software Test Engineer",
    team: "Web Framework Team",
    dateRange: "Sep '22 - Dec '22",
    startDate: "2022-09-01",
    endDate: "2022-12-01",
    type: "internship",
    tags: ["Git", "C#", ".NET", "Test Automation"],
    logoSrc: "/logos/dayforce.png",
    summary: [
      "Expanded test automation coverage by significantly, catching defects pre-release and cutting QA cycles for enterprise-scale payroll systems.",
    ],
    details: {
      challenges:
        "The existing test framework was slow enough that people avoided running it locally, so before I could grow coverage I had to profile and speed up the framework itself - otherwise more tests would've just meant more time wasted.",
      growth:
        "My first real internship, and it's where I learned that testing isn't a separate discipline bolted onto engineering - coverage, speed, and defect rate are all the same problem viewed from different angles.",
    },
  },
  {
    id: "ryerson-hyperloop-team-lead",
    company: "Ryerson International Hyperloop",
    role: "Guidance, Navigation & Control: Assistant Team Lead",
    team: "Guidance, Navigation & Control Team",
    dateRange: "May '22 - Apr '23",
    startDate: "2022-05-01",
    endDate: "2023-04-01",
    type: "freelance",
    tags: ["Cross-functional Team Leadership", "C++", "Embedded Systems"],
    logoSrc: "/logos/ryerson-hyperloop.jpeg",
    summary: [
      "Spearheaded a dynamic student hyperloop team as a Software Engineer, overseeing the design and development of critical control systems for the high-speed transportation prototype.",
      "Designed and implemented innovative software solutions to optimize the hyperloop's performance, resulting in a 15% increase in speed and safety enhancements using project management software.",
    ],
    details: {
      challenges:
        "Leading the GNC team while still writing the control software myself meant constantly switching between hands-on debugging and unblocking teammates - balancing those two modes without dropping either was the real challenge of the role.",
      growth:
        "Stepping up to lead a team I'd been an individual contributor on taught me to delegate deliberately, and seeing our changes translate into a measurable 15% speed increase was proof that leadership and hands-on engineering weren't in tension.",
    },
  },
  {
    id: "ryerson-hyperloop-data-acquisition",
    company: "Ryerson International Hyperloop",
    role: "Guidance, Navigation & Control: Data Acquisition Member",
    team: "Data Acquisition Member Team",
    dateRange: "Jan '22 - May '22",
    startDate: "2022-01-01",
    endDate: "2022-05-01",
    type: "freelance",
    tags: ["Embedded Systems", "Electronics", "C++"],
    logoSrc: "/logos/ryerson-hyperloop.jpeg",
    summary: [
      "Researched and analyzed electronic parts that can potentially be implemented in the final design of the Pod.",
      "Contributed to the development of a full suite of electronics required to monitor and control the Pod remotely, and was responsible for developing the southbridge of the pod, troubleshooting and developing technical designs.",
    ],
    details: {
      challenges:
        "Component research for a first-of-its-kind pod meant there wasn't always a clear reference design to work from - a lot of the southbridge work involved trial, measurement, and troubleshooting rather than following an existing spec.",
      growth:
        "This was my first hands-on embedded systems work, and it's where I first got comfortable moving between low-level electronics and the software that had to talk to them reliably.",
    },
  },
  // {
  //   id: "independent-creator",
  //   company: "Independent",
  //   role: "Content Creator",
  //   dateRange: "2021 - Present",
  //   startDate: "2021-01-01", // ongoing — duration is computed live, not hardcoded
  //   type: "freelance",
  //   tags: ["Video Editing", "Illustration", "Social Strategy"],
  //   summary:
  //     "Placeholder: ongoing freelance content work - video, illustration, and social media management for clients.",
  //   details: {
  //     challenges:
  //       "Placeholder: describe a creative or logistical challenge from freelance work.",
  //     growth:
  //       "Placeholder: describe how running creative work independently shaped your taste and process.",
  //   },
  // },
];
