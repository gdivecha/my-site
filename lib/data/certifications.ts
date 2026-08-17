export type CertificationCategoryId = "development" | "data" | "professional";

/** "major" = a big, formally-proctored/official credential (AWS, Google
 * Cloud, PMP, etc.) — worth its own prominent treatment on the page.
 * "standard" = everything else (course completions, skill assessments,
 * workshop badges — Coursera/LinkedIn Learning/DataCamp/HackerRank and
 * similar). */
export type CertificationTier = "major" | "standard";

export type Certification = {
  name: string;
  issuer: string;
  /** When it was earned, e.g. "Jun 2024" — kept as a plain display string
   * (like Experience/Academics' dateRange) rather than a parsed Date;
   * see certificationSortDate below for the one place this gets parsed,
   * for sorting rather than display. Optional — a handful of real
   * credentials had their date supplied without one; omitted rather than
   * guessed, and the card just doesn't show a date line for those. */
  date?: string;
  category: CertificationCategoryId;
  tier: CertificationTier;
  /** Optional — issuer logo for "major" certs (falls back to the category
   * medallion when absent, same as Experience's logoSrc/ImagePlaceholder
   * split). Not used by "standard" cards, which always use the medallion. */
  logoSrc?: string;
  /** Optional — shown under the date only when present. */
  credentialId?: string;
  /** Optional — when present, the card links out to it. */
  credentialUrl?: string;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Parses `date` ("Mon YYYY") into a plain comparable number
 * (year * 12 + monthIndex) for sorting only — display always uses the
 * original string. Falls back to 0 (sorts as "oldest") for a date that
 * doesn't match the expected format rather than throwing, since this
 * only ever drives a sort order, not something worth crashing a page
 * over. */
export function certificationSortDate(cert: Certification): number {
  if (!cert.date) return 0;
  const [monthStr, yearStr] = cert.date.split(" ");
  const month = MONTHS.indexOf(monthStr);
  const year = parseInt(yearStr, 10);
  if (month === -1 || Number.isNaN(year)) return 0;
  return year * 12 + month;
}

export const certificationCategories: {
  id: CertificationCategoryId;
  label: string;
}[] = [
  { id: "development", label: "Development" },
  { id: "data", label: "Data & SQL" },
  { id: "professional", label: "Professional" },
];

/** No "major" (formally-proctored) credentials yet — everything below is
 * a course completion or skill assessment. A few (Pluralsight/DataCamp/
 * WHMIS) still have no public verification link and won't show a "View
 * credential" affordance until one's on hand. */
export const certifications: Certification[] = [
  {
    name: "JDBC Servlets and JSP - Java Web Development Fundamentals",
    issuer: "Udemy",
    // Date not supplied yet — omitted rather than guessed; ask for it
    // and fill in once known.
    category: "development",
    tier: "standard",
    credentialUrl:
      "https://www.udemy.com/certificate/UC-d6a892d0-399b-4413-ba50-fa929fe30cf5/",
  },
  {
    name: "HTML, CSS, and JavaScript: The Big Picture",
    issuer: "Pluralsight",
    date: "Jan 2023",
    category: "development",
    tier: "standard",
  },
  {
    name: "Git Essential Training: The Basics",
    issuer: "LinkedIn",
    date: "Nov 2022",
    category: "development",
    tier: "standard",
    credentialUrl:
      "https://www.linkedin.com/learning/certificates/e283374918efa5f90531171ded0c223b757e94d6fe332e2a9dd3fb04071ac778",
  },
  {
    name: "Business Readable Automated Tests with SpecFlow 2.0",
    issuer: "Pluralsight",
    date: "Oct 2022",
    category: "development",
    tier: "standard",
  },
  {
    name: "Data Analysis with SQL (PostgreSQL): 81st Percentile - Advanced",
    issuer: "DataCamp",
    date: "Oct 2022",
    category: "data",
    tier: "standard",
  },
  {
    name: "Data Management in SQL (PostgreSQL): 89th Percentile - Advanced",
    issuer: "DataCamp",
    date: "Oct 2022",
    category: "data",
    tier: "standard",
  },
  {
    name: "SQL Skills Assessment (Intermediate)",
    issuer: "HackerRank",
    date: "Oct 2022",
    category: "data",
    tier: "standard",
    credentialId: "eb1071264773",
    credentialUrl: "https://www.hackerrank.com/certificates/eb1071264773",
  },
  {
    name: "SQL Skills Assessment (Basic)",
    issuer: "HackerRank",
    date: "Oct 2022",
    category: "data",
    tier: "standard",
    credentialId: "b640d53ea1dc",
    credentialUrl: "https://www.hackerrank.com/certificates/b640d53ea1dc",
  },
  {
    name: "Agile Development Practices",
    issuer: "LinkedIn",
    date: "Oct 2022",
    category: "development",
    tier: "standard",
    credentialUrl:
      "https://www.linkedin.com/learning/certificates/c199abe2a1429d474016b431c8b4e8a208771e7baa4a4ecf2da4537d209c8111",
  },
  {
    name: "SQL Essential Training",
    issuer: "LinkedIn",
    date: "Oct 2022",
    category: "data",
    tier: "standard",
    credentialUrl:
      "https://www.linkedin.com/learning/certificates/3596416d293b83c9e9701969ae96fed3286e10625efafb72ffd65e3a61f3c838",
  },
  {
    name: "Behavior-Driven Development",
    issuer: "LinkedIn",
    date: "Sep 2022",
    category: "development",
    tier: "standard",
    credentialUrl:
      "https://www.linkedin.com/learning/certificates/37ce5b3acfd18de48af025a576726e20f00c5a31cc18ce146c55701b1c2d0db3",
  },
  {
    name: "Java Skills Assessment",
    issuer: "HackerRank",
    date: "Aug 2022",
    category: "development",
    tier: "standard",
    credentialId: "C2BAAE39A1F1",
    credentialUrl: "https://www.hackerrank.com/certificates/c2baae39a1f1",
  },
  {
    name: "Problem Solving - Algorithms and Data Structures",
    issuer: "HackerRank",
    date: "Aug 2022",
    category: "development",
    tier: "standard",
    credentialId: "971970CC8FB6",
    credentialUrl: "https://www.hackerrank.com/certificates/971970cc8fb6",
  },
  {
    name: "Python Skills Assessment",
    issuer: "HackerRank",
    date: "Aug 2022",
    category: "development",
    tier: "standard",
    credentialId: "AB90D6E81B38",
    credentialUrl: "https://www.hackerrank.com/certificates/ab90d6e81b38",
  },
  {
    name: "Co-op/Internship Preparation Program",
    issuer: "Toronto Metropolitan University",
    date: "Aug 2022",
    category: "professional",
    tier: "standard",
    credentialUrl:
      "https://drive.google.com/file/d/1iLxR7vFwcsqlRjc0sOBF2DmX-y6VrRFn/view",
  },
  {
    name: "Tech Stewardship Practice Program - Certified Tech Steward",
    issuer: "Tech Stewardship",
    date: "Aug 2022",
    category: "professional",
    tier: "standard",
    credentialId: "69354842537882",
    credentialUrl:
      "https://verified.sertifier.com/en/verify/69354842537882/",
  },
  {
    name: "CSS Fundamentals",
    issuer: "Sololearn",
    date: "Jul 2022",
    category: "development",
    tier: "standard",
    credentialUrl: "https://www.sololearn.com/Certificate/CT-UVPWAJVX/jpg",
  },
  {
    name: "Python Programming Assessment: 86th Percentile - Advanced",
    issuer: "DataCamp",
    date: "Jul 2022",
    category: "data",
    tier: "standard",
  },
  {
    name: "Java and Object Oriented Programming",
    issuer: "Sololearn",
    date: "Jul 2022",
    category: "development",
    tier: "standard",
    credentialUrl: "https://www.sololearn.com/Certificate/CT-AXGYNQBT/png",
  },
  {
    name: "HTML Fundamentals",
    issuer: "Sololearn",
    date: "Jul 2022",
    category: "development",
    tier: "standard",
    credentialUrl: "https://www.sololearn.com/Certificate/CT-VRRONAXV/jpg",
  },
  {
    name: "Crash Course on Python",
    issuer: "Google",
    date: "May 2022",
    category: "development",
    tier: "standard",
    credentialId: "ZENL96AJ3PUH",
    credentialUrl:
      "https://www.coursera.org/account/accomplishments/verify/ZENL96AJ3PUH",
  },
  {
    name: "Workplace Hazardous Materials Information System (WHMIS) Certificate",
    issuer: "Toronto Metropolitan University",
    date: "Nov 2020",
    category: "professional",
    tier: "standard",
  },
];
