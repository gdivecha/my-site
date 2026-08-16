export type CourseCategoryId =
  | "software-engineering"
  | "systems-networks"
  | "algorithms-theory"
  | "math-probability"
  | "data-ai";

export const courseCategories: { id: CourseCategoryId; label: string; icon: string }[] = [
  { id: "software-engineering", label: "Software Engineering Practice", icon: "🏗️" },
  { id: "systems-networks", label: "Systems & Networks", icon: "🖥️" },
  { id: "algorithms-theory", label: "Algorithms & Theory", icon: "📊" },
  { id: "math-probability", label: "Math & Probability", icon: "🎲" },
  { id: "data-ai", label: "Data & AI", icon: "🗄️" },
];

export type Course = {
  icon: string;
  title: string;
  description: string;
  category: CourseCategoryId;
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
  // Real coursework pulled from the official TMU transcript — every entry
  // here is a real course with a B- grade or better, kept to the ones
  // genuinely relevant to software engineering (electives like
  // Communication in Engineering, and non-CS courses like Physics/
  // Thermodynamics/Geography/History, are left off; math courses are kept
  // since they underpin CS/ML work directly). Grades for COE 817/COE 892
  // reflect the retake, which is what's actually counted on the
  // transcript. Not exhaustive of every relevant course taken — see the
  // transcript for the full list if this needs revisiting.
  coursework: [
    {
      icon: "📊",
      title: "Algorithms and Data Structures",
      description: "Core data structures, algorithm design, and complexity analysis.",
      category: "algorithms-theory",
    },
    {
      icon: "🧮",
      title: "Advanced Algorithms",
      description: "Advanced algorithm design, analysis, and optimization techniques.",
      category: "algorithms-theory",
    },
    {
      icon: "🗄️",
      title: "Database Systems I",
      description: "Relational database design, normalization, and query optimization.",
      category: "data-ai",
    },
    {
      icon: "🔌",
      title: "Digital Systems",
      description: "Digital logic design, from boolean algebra to sequential circuits.",
      category: "systems-networks",
    },
    {
      icon: "🔢",
      title: "Discrete Mathematics",
      description: "Logic, set theory, combinatorics, and graph theory for CS.",
      category: "algorithms-theory",
    },
    {
      icon: "➗",
      title: "Differential Equations & Vector Calculus",
      description: "Differential equations and vector calculus for engineering systems.",
      category: "math-probability",
    },
    {
      icon: "🎲",
      title: "Probability and Stochastic Processes",
      description: "Probability theory and stochastic processes for engineering and ML.",
      category: "math-probability",
    },
    {
      icon: "🖥️",
      title: "Microprocessor Systems",
      description: "Microprocessor architecture, assembly, and embedded systems.",
      category: "systems-networks",
    },
    {
      icon: "🧩",
      title: "Object-Oriented Analysis and Design",
      description: "Object-oriented analysis, UML modeling, and design patterns.",
      category: "software-engineering",
    },
    {
      icon: "☕",
      title: "Object-Oriented Programming in Java",
      description: "Object-oriented programming fundamentals and design in Java.",
      category: "software-engineering",
    },
    {
      icon: "⚙️",
      title: "Operating Systems",
      description: "Process scheduling, memory management, and concurrency.",
      category: "systems-networks",
    },
    {
      icon: "🏗️",
      title: "Software Design and Architecture",
      description: "Large-scale software architecture and design patterns.",
      category: "software-engineering",
    },
    {
      icon: "📋",
      title: "Software Requirements Analysis",
      description: "Requirements gathering, specification, and stakeholder analysis.",
      category: "software-engineering",
    },
    {
      icon: "📅",
      title: "Software Project Management",
      description: "Planning, scheduling, and managing software development projects.",
      category: "software-engineering",
    },
    {
      icon: "🌐",
      title: "Computer Networks",
      description: "Network protocols, architecture, and data communication.",
      category: "systems-networks",
    },
    {
      icon: "🔒",
      title: "Network Security",
      description: "Network security principles, threats, and defense mechanisms.",
      category: "systems-networks",
    },
    {
      icon: "☁️",
      title: "Distributed Cloud Computing",
      description: "Distributed systems design and cloud computing architecture.",
      category: "systems-networks",
    },
    {
      icon: "👁️",
      title: "Introduction to Computer Vision",
      description: "Image processing and computer vision fundamentals.",
      category: "data-ai",
    },
    {
      icon: "🎓",
      title: "Engineering Capstone Design",
      description: "Full-cycle capstone project applying engineering design principles.",
      category: "software-engineering",
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
