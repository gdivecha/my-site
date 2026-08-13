export type Course = {
  icon: string;
  title: string;
};

export type Achievement = {
  icon: string;
  title: string;
  description?: string;
};

export const education = {
  school: "Toronto Metropolitan University",
  degree: "B.Eng. Computer Engineering (Software Engineering Specialization)",
  dateRange: "September 2020 - April 2026",
  location: "Toronto, ON, Canada",
  overview:
    "I focused on building scalable systems - from low-level fundamentals to distributed architectures. That foundation shaped how I approach backend design at Amazon and Dayforce: thinking about scale, reliability, and production systems from day one.",
  coursework: [
    { icon: "📊", title: "Data Structures & Algorithms" },
    { icon: "☁️", title: "Scalable Cloud Applications" },
    { icon: "🔗", title: "Distributed Systems" },
    { icon: "💾", title: "Database Design" },
    { icon: "🌐", title: "Web Development" },
    { icon: "⚙️", title: "Systems Programming" },
    { icon: "🔐", title: "Software Architecture" },
    { icon: "📡", title: "Cloud Infrastructure" },
  ] satisfies Course[],
  achievements: [
    {
      icon: "🏆",
      title: "Dean's Honours List",
      description: "2020-2021, 2021-2022",
    },
    {
      icon: "6️⃣",
      title: "Concurrent Internships",
      description:
        "Completed 6 internships while maintaining coursework",
    },
  ] satisfies Achievement[],
};
