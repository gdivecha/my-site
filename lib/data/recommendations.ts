export type RecommendationCategory =
  | "software-engineering"
  | "content-creation"
  | "artist"
  | "freelance";

export type Recommendation = {
  id: string;
  quote: string;
  category: RecommendationCategory;
  company: string;
  role: string;
  term: string;
  recommenderName: string;
  recommenderTitle: string;
  relationship: string;
  linkedin?: string;
};

// Placeholder content — swap in real recommendations and recommender details.
export const recommendations: Recommendation[] = [
  {
    id: "1",
    quote:
      "Placeholder testimonial: Gaurav consistently shipped high-quality work ahead of schedule and made everyone around him better at communicating technical tradeoffs.",
    category: "software-engineering",
    company: "Amazon",
    role: "Software Development Engineer Intern",
    term: "Summer 2025 · Internship",
    recommenderName: "Alex Chen",
    recommenderTitle: "Senior Software Engineer",
    relationship: "My Manager",
    linkedin: "#",
  },
  {
    id: "2",
    quote:
      "Placeholder testimonial: one of the fastest ramps I've seen from an intern — asked sharp questions and owned an ambiguous feature end to end.",
    category: "software-engineering",
    company: "Amazon",
    role: "Software Development Engineer Intern",
    term: "Summer 2025 · Internship",
    recommenderName: "Priya Nair",
    recommenderTitle: "Engineering Manager",
    relationship: "My Mentor",
    linkedin: "#",
  },
  {
    id: "3",
    quote:
      "Placeholder testimonial: Gaurav's attention to detail on the payroll engine work saved us from a nasty edge case before it ever reached production.",
    category: "software-engineering",
    company: "Dayforce",
    role: "Software Engineer Intern",
    term: "Fall 2023 · Internship",
    recommenderName: "Jordan Blake",
    recommenderTitle: "Staff Software Engineer",
    relationship: "My Manager",
    linkedin: "#",
  },
  {
    id: "4",
    quote:
      "Placeholder testimonial: a genuinely great teammate — clear in code review, calm under deadline pressure, and always willing to pair.",
    category: "software-engineering",
    company: "Dayforce",
    role: "Software Engineer Intern",
    term: "Fall 2023 · Internship",
    recommenderName: "Sam Okafor",
    recommenderTitle: "Software Engineer II",
    relationship: "My Teammate",
    linkedin: "#",
  },
  {
    id: "5",
    quote:
      "Placeholder testimonial: Gaurav's firmware work on the controls subteam was the backbone of our competition pod — reliable under pressure, every time.",
    category: "freelance",
    company: "Ryerson International Hyperloop",
    role: "Software & Firmware Engineer",
    term: "2022 – 2023 · Student Team",
    recommenderName: "Morgan Reyes",
    recommenderTitle: "Team Captain",
    relationship: "My Team Lead",
    linkedin: "#",
  },
  {
    id: "6",
    quote:
      "Placeholder testimonial: as a mentor to newer members, Gaurav had a rare ability to explain embedded systems concepts without making anyone feel behind.",
    category: "freelance",
    company: "Ryerson International Hyperloop",
    role: "Software & Firmware Engineer",
    term: "2022 – 2023 · Student Team",
    recommenderName: "Devon Park",
    recommenderTitle: "Controls Subteam Member",
    relationship: "My Mentee",
    linkedin: "#",
  },
  {
    id: "7",
    quote:
      "Placeholder testimonial: the edit turnaround and creative instincts on this project were better than agencies we've paid ten times as much.",
    category: "content-creation",
    company: "Independent",
    role: "Content Creator",
    term: "2021 – Present · Freelance",
    recommenderName: "Taylor Brooks",
    recommenderTitle: "Marketing Lead, Client Project",
    relationship: "My Client",
    linkedin: "#",
  },
  {
    id: "8",
    quote:
      "Placeholder testimonial: Gaurav has a distinct visual style — every piece feels considered, never generic.",
    category: "artist",
    company: "Independent",
    role: "Illustrator",
    term: "2020 – Present · Freelance",
    recommenderName: "Ría Fernandes",
    recommenderTitle: "Art Director",
    relationship: "My Collaborator",
    linkedin: "#",
  },
];

export const recommendationCategories: {
  id: RecommendationCategory;
  label: string;
}[] = [
  { id: "software-engineering", label: "Software Engineering" },
  { id: "content-creation", label: "Content Creation" },
  { id: "artist", label: "Artist" },
  { id: "freelance", label: "Freelance" },
];

export const recommendationCompanies: string[] = [
  "Dayforce",
  "Amazon",
  "Ryerson International Hyperloop",
];
