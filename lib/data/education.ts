export type Course = {
  icon: string;
  title: string;
  description: string;
};

export type Achievement = {
  icon: string;
  title: string;
  description?: string;
};

export const education = {
  school: "Toronto Metropolitan University",
  logoSrc: "/logos/tmu.jpg",
  degree: "B.Eng. Computer Engineering (Software Engineering Specialization)",
  dateRange: "September 2020 - April 2026",
  location: "Toronto, ON, Canada",
  overview:
    "I focused on building scalable systems - from low-level fundamentals to distributed architectures. That foundation shaped how I approach backend design at Amazon and Dayforce: thinking about scale, reliability, and production systems from day one.",
  coursework: [
    {
      icon: "📊",
      title: "Data Structures & Algorithms",
      description: "Data structures, algorithms, and complexity analysis.",
    },
    {
      icon: "☁️",
      title: "Scalable Cloud Applications",
      description: "Deploying applications that scale reliably in the cloud.",
    },
    {
      icon: "🔗",
      title: "Distributed Systems",
      description: "Fault tolerance and coordination in distributed systems.",
    },
    {
      icon: "💾",
      title: "Database Design",
      description: "Relational modeling and query optimization.",
    },
    {
      icon: "🌐",
      title: "Web Development",
      description:
        "Full-stack web application design, from client to server.",
    },
    {
      icon: "⚙️",
      title: "Systems Programming",
      description: "Low-level programming and OS fundamentals.",
    },
    {
      icon: "🔐",
      title: "Software Architecture",
      description: "Design patterns and large-scale software structure.",
    },
    {
      icon: "📡",
      title: "Cloud Infrastructure",
      description: "Infrastructure-as-code, containers, and cloud deployment.",
    },
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
