export type RecommendationCategory =
  | "software-engineering"
  | "content-creation"
  | "artist"
  | "freelance";

// Short, hand-picked excerpts for the preview grid at the top of the page.
// These are pulled manually from the full recommendations below for quick
// reading. recommendationId links back to the source in `recommendations`
// so the preview card can show real attribution (name/title/company)
// without copying those fields in twice — leave it unset for an excerpt
// that isn't backed by a full entry below yet (see the two below without
// one: neither has a matching recommendation to cite).
export type PreviewQuote = {
  id: string;
  quote: string;
  category: RecommendationCategory;
  recommendationId?: string;
};

// Ordered by the recommender's authority relative to Gaurav (manager >
// lead > senior > individual contributor > intern/colleague), most to
// least — not by company or recency.
export const previewQuotes: PreviewQuote[] = [
  {
    id: "preview-1",
    // Chris Zou — Software Development Manager, My Manager (Amazon)
    quote: "His unwavering dedication to excellence, combined with this relentless pursuit of growth, positions him as a valuable asset in any tech environment.",
    category: "software-engineering",
    recommendationId: "2",
  },
  {
    id: "preview-2",
    // Jason Wu — Software Development Manager, My Manager (Dayforce)
    quote: "Equipped with a driven attitude and a positive mindset, he was able to quickly learn and contribute.",
    category: "software-engineering",
    recommendationId: "11",
  },
  {
    id: "preview-3",
    // Ayon Saha — Lead Performance Engineer, My Senior (Dayforce)
    quote: "Gaurav is an asset, excellent communication, good ability to comprehend complex instructions and execute on them.",
    category: "software-engineering",
    recommendationId: "7",
  },
  {
    id: "preview-4",
    // Azmat Mungur — Senior Performance Engineer, My Mentor (Dayforce)
    quote: "He is one of the most talented and dedicated developers I have ever worked with.",
    category: "software-engineering",
    recommendationId: "4",
  },
  {
    id: "preview-5",
    // Nikolay Labzin — Business System Analyst, My Senior (Dayforce)
    quote: "Driving force behind both the design - participating in all discussions and brainstorming, taking requirements, and creating refined UI designs - and its instrumentation and front-end development using various frameworks.",
    category: "software-engineering",
    recommendationId: "5",
  },
  {
    id: "preview-6",
    // Fazeel Abbasi — Software Development Engineer I, My Mentor (Amazon)
    quote: "Gaurav displayed an incredible work ethic and was determined to cross any hurdle he faced.",
    category: "software-engineering",
    recommendationId: "1",
  },
  {
    id: "preview-7",
    // Gokulnath Dayalan — Software Developer Intern, My Colleague (Dayforce)
    quote: "Gaurav’s ability to work well under pressure and deliver quality results consistently is truly impressive.",
    category: "software-engineering",
    recommendationId: "6",
  },
  {
    id: "preview-8",
    // Alina Tang — Early Talent Intern, My Colleague (Dayforce)
    quote: "Isn't afraid to ask for constructive feedback and will use it to reach his goals.",
    category: "software-engineering",
    recommendationId: "10",
  },
];

// Full recommendations — shown grouped by company/role in the "Interested
// in reading more?" section, each with its own attribution.
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
      "I had the pleasure of mentoring Gaurav during his 2024 Summer Internship at Amazon. Gaurav displayed an incredible work ethic and was determined to cross any hurdle he faced. Gaurav designed and implemented a complex backend solution end to end including the infrastructure setup from the ground up during his internship. He demonstrated that he can pick up on new technologies and frameworks very quickly and use them effectively with his incredible problem solving skills. In short , undoubtedly Gaurav has a bright future ahead of him and is an asset to any team that has the fortune to have him.",
    category: "software-engineering",
    company: "Amazon",
    role: "Software Development Engineer Intern",
    term: "Summer 2024 · Internship",
    recommenderName: "Fazeel Abbasi",
    recommenderTitle: "Software Development Engineer I",
    relationship: "My Mentor",
    linkedin: "https://www.linkedin.com/in/fazeelabbasi",
  },
  {
    id: "2",
    quote:
      "I had the pleasure of collaborating with Gaurav in Amazon this summer. Gaurav took charge of a pivotal project, producing numerous well-crafted code reviews. Beyond his technical skills, what stands out is Gaurav's commitment to continuous learning and his ability to seamlessly collaborate with team members, fostering a spirit of unity and cohesion. Gaurav consistently demonstrates an openness to feedback, paired with an unwavering growth mindset, always seeking opportunities to evolve and refine his craft. His unwavering dedication to excellence, combined with this relentless pursuit of growth, positions him as a valuable asset in any tech environment.",
    category: "software-engineering",
    company: "Amazon",
    role: "Software Development Engineer Intern",
    term: "Summer 2023 · Internship",
    recommenderName: "Chris Zou",
    recommenderTitle: "Software Development Manager",
    relationship: "My Manager",
    linkedin: "https://www.linkedin.com/in/chriszoux",
  },
  {
    id: "3",
    quote:
      "I was Gaurav’s mentor during his Summer 2023 internship at Amazon. I saw Gaurav demonstrate considerable work ethic as he designed a solution to his project problem and independently shipped many features over concise pull requests. Gaurav demonstrated his software engineering skills though his React and TypeScript programming and ability to deal with important areas such as UX design, integration testing, and API authentication.",
    category: "software-engineering",
    company: "Amazon",
    role: "Software Development Engineer Intern",
    term: "Summer 2023 · Internship",
    recommenderName: "Jack Buckley",
    recommenderTitle: "Software Development Engineer I",
    relationship: "My Mentor",
    linkedin: "https://www.linkedin.com/in/jackjbuckley",
  },
  {
    id: "4",
    quote:
      "I had the pleasure of mentoring and working together with Gaurav during his internship in our Performance Engineering team as a Full Stack Software Developer Intern, and I can confidently say that he is one of the most talented and dedicated developers I have ever worked with. His technical skills were outstanding, and he possess a rare ability to think creatively and solve complex problems with ease. Throughout our time together, Gaurav demonstrated a strong work ethic, always bringing a positive vibe to the team, a hunger to learn and grow, and an unwavering commitment to excellence. He learnt the basics of Performance Engineering and how our team operates with the whole lot of tech stacks and tools, React, .NET 6, UX/UI concepts, introduced Figma to our team and amazed the senior devs with his Figma UI designs. He consistently produced high-quality work, and went above and beyond to ensure that the design and development works on our internal reporting dashboard portal were delivered on time and exceeded expectations. Moreover, he is an exceptional communicator and a natural team player. He is really agile, his positive attitude and collaborative spirit make him a joy to work with. In short, I have no doubt that Gaurav will be a valuable asset to any organization lucky enough to have him on their team and hopefully he'll be back within Ceridian, working together with me in the future. I wholeheartedly recommend him for any software development role, and I am confident that he will excel in whatever he choose to pursue.",
    category: "software-engineering",
    company: "Dayforce",
    role: "Software Developer Intern",
    term: "Winter 2023 · Fall 2023 · Internship",
    recommenderName: "Azmat Mungur",
    recommenderTitle: "Senior Performance Engineer",
    relationship: "My Mentor",
    linkedin: "https://www.linkedin.com/in/azmatmungur",
  },
  {
    id: "5",
    quote:
      "I had the pleasure of working with Gaurav during his internship with our team. Throughout his time here, he has been an invaluable partner and colleague, working on multiple different aspects of our internal performance reporting tool; specifically, he has been instrumental in designing and creating a custom reporting dashboard for supporting reports of enterprise-level clients. This was a brand new project that our team took on, and Gaurav was the driving force behind both the design and the development phases. Some of the highlights were: participating in all discussions and brainstorming, capturing requirements, creating refined UI designs in Figma, and instrumenting/developing the app (using various frameworks such as React). During the process Gaurav remained outcome-driven, bringing creative ideas and problem-solving to the table, as well as staying agile and focused when changes in direction or scope came up. Overall, Gaurav has a strong grasp of application development, with a keen understanding of UX/UI design. He brings a consistently positive attitude to work every day, alongside the ability to approach challenges from multiple creative angles, exemplifying the Agile mindset. I can confidently say that he is an asset to any team or project. I highly recommend him, and I hope I have the chance to work with him again in the future.",
    category: "software-engineering",
    company: "Dayforce",
    role: "Software Developer Intern",
    term: "Winter 2023 · Fall 2023 · Internship",
    recommenderName: "Nikolay Labzin",
    recommenderTitle: "Business System Analyst",
    relationship: "My Senior",
    linkedin: "https://www.linkedin.com/in/nlabzin",
  },
  {
    id: "6",
    quote:
      "I would highly recommend Gaurav as an exceptional software developer who possesses a great skill set and the ability to learn and adapt quickly. His experience with front-end development using React, along with his ability to collaborate effectively in an agile scrum environment, showcases his technical skills and teamwork capabilities. Gaurav has shown a keen eye for detail and an understanding of effective UI/UX practices while working on the internal performance engineering tool suite and dashboard, which has greatly increased the productivity of our fellow performance engineer teammates. His ability to take ownership of the project and handle constant changes requested by the team demonstrates his determination and willingness to learn. Additionally, I would like to highlight that Gaurav's positive attitude, enthusiasm and eagerness to learn have helped to foster a collaborative and productive work environment, and his contributions to the project have been instrumental in its success. Gaurav's dedication and commitment to the project have made him an irreplaceable member of the team, and his ability to work well under pressure and deliver quality results consistently is truly impressive. I have no doubt that he will continue to thrive and excel in his future endeavors, and I highly recommend him without reservation.",
    category: "software-engineering",
    company: "Dayforce",
    role: "Software Developer Intern",
    term: "Winter 2023 · Fall 2023 · Internship",
    recommenderName: "Gokulnath Dayalan",
    recommenderTitle: "Software Developer Intern",
    relationship: "My Colleague",
    linkedin: "https://www.linkedin.com/in/gokulnath-dayalan-712b26103",
  },
  {
    id: "7",
    quote:
      "Gaurav is an asset, excellent communication, good ability to comprehend complex instructions and execute on them. He is proactive and enjoys ownership of his deliverables. I received a lot of good feedback on the tasks he worked  during his time with our performance engineering team. In particular he has great skill in designing of web application. I have immense respect for his work ethics and look forward to working with him in the future.",
    category: "software-engineering",
    company: "Dayforce",
    role: "Software Developer Intern",
    term: "Winter 2023 · Fall 2023 · Internship",
    recommenderName: "Ayon Saha",
    recommenderTitle: "Lead Performance Engineer",
    relationship: "My Senior",
    linkedin: "https://www.linkedin.com/in/sahaayon",
  },
  {
    id: "8",
    quote:
      "Gaurav is highly motivated, goal - oriented and detail driven. Gaurav likes to build deep skills and ask penetrating questions that help grow the knowledge base of all in the team. This was evident during Gaurav’s contributions in development efforts towards our Internal Performance Engineering tool suite. Gaurav was able to take the lead, pace himself from the ground up to learn new skills and build multiple features and enhancements for the team all in a highly agile and fluid environment.",
    category: "software-engineering",
    company: "Dayforce",
    role: "Software Developer Intern",
    term: "Winter 2023 · Fall 2023 · Internship",
    recommenderName: "Manoj Mohanan",
    recommenderTitle: "Senior Performance Engineer",
    relationship: "My Mentor",
    linkedin: "https://www.linkedin.com/in/manoj-mohanan",
  },
  {
    id: "9",
    quote:
      "Gaurav did very well in his first internship. He is quite organized, diligent, highly motivated and a fast learner. Gaurav helped the team with automation and daily analysis. Gaurav collaborated with the team and is a great team player. It was a pleasure working and mentoring Gaurav.",
    category: "software-engineering",
    company: "Dayforce",
    role: "Software Test Engineer Intern",
    term: "Fall 2022 · Internship",
    recommenderName: "Khatina Francis",
    recommenderTitle: "Senior Test Engineer",
    relationship: "My Mentor",
    linkedin: "https://www.linkedin.com/in/khatinafrancis",
  },
  {
    id: "10",
    quote:
      "Gaurav and I both worked at Ceridian as interns. Although we worked in different business groups and roles, Gaurav has shown to be a bright and eager student who seeks to constantly improve his skills. He isn't afraid to ask for constructive feedback and will use it to reach his goals. With his determination, he will be a great addition to any team.",
    category: "software-engineering",
    company: "Dayforce",
    role: "Software Test Engineer Intern",
    term: "Fall 2022 · Internship",
    recommenderName: "Alina Tang",
    recommenderTitle: "Early Talent Intern",
    relationship: "My Colleague",
    linkedin: "https://www.linkedin.com/in/alina-tang-92b3421a8",
  },
  {
    id: "11",
    quote:
      "Gaurav was a test engineer intern on my team. Equipped with a driven attitude and a positive mindset, he was able to quickly learn and contribute. He was a wonderful team player and also communicated well. He would be an excellent addition to any teams.",
    category: "software-engineering",
    company: "Dayforce",
    role: "Software Developer Intern",
    term: "Fall 2022 · Internship",
    recommenderName: "Jason Wu",
    recommenderTitle: "Software Development Manager",
    relationship: "My Manager",
    linkedin: "https://www.linkedin.com/in/jasonhanwu",
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
