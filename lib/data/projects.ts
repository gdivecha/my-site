export type ProjectCategory = "full-stack" | "backend" | "hardware";

export type ProjectDetailBlock = {
  title: string;
  text: string;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  /** 1-5, judged on scope/complexity — team size, architecture, breadth
   * of the stack involved. Used only for the Projects page's "By scale"
   * sort, never displayed directly. */
  scale: number;
  videoUrl?: string;
  /** Optional — when present, the detail page links out to the source. */
  repoUrl?: string;
  details: ProjectDetailBlock[];
};

// Array order is chronological (most recent first) — see home/page.tsx's
// featuredProject, which just takes the first entry.
export const projects: Project[] = [
  {
    id: "relianet",
    slug: "relianet",
    name: "ReliaNet: Distributed Truth-Seeking Network",
    description:
      "A 5-node distributed key-value store built for disaster response - staying consistent and available even through a 40% simultaneous node loss.",
    category: "backend",
    scale: 5,
    tags: ["Python", "FastAPI", "gRPC", "RabbitMQ", "Docker", "Streamlit"],
    repoUrl: "https://github.com/gdivecha/ReliaNet",
    details: [
      {
        title: "Picture this",
        text: "A storm knocks out a city's internet, or a server room floods. If every emergency alert, casualty report, and news update lived on one computer, that one computer going down means everyone loses access at the worst possible moment. ReliaNet's whole premise: never let anything important live in only one place.",
      },
      {
        title: "Five notebooks, one truth",
        text: "Instead of one server, ReliaNet spreads the same data across 5 independent computers, each keeping its own copy - like 5 people writing the same note in 5 separate notebooks the moment it's written. To read something back, it doesn't trust just one notebook - it asks a majority of the 5 what they've got, and only accepts an answer once most of them agree. One broken or lying notebook can't fool the group.",
      },
      {
        title: "Built to survive",
        text: "We tested this by actually killing servers mid-operation. Unplug one node - traffic instantly reroutes, zero downtime. Kill 2 of the 5 at once (a simulated disaster wiping out 40% of the network) - the system notices, redraws \"majority\" from 3 votes down to 2, and keeps running with no help from us. Make one node painfully slow - it gets 1.5 seconds to respond, then gets skipped, so one bad connection can't freeze everyone else. And a node that comes back online after being knocked out compares notes with the others and catches itself up automatically in about 12 seconds.",
      },
      {
        title: "Why it matters",
        text: "For a disaster-response or news network, that means one destroyed server, one power outage, or one cut cable can't silence the whole system - the same kind of resilience real-world systems like DNS lean on, built from scratch by a team of four for a university distributed-systems course.",
      },
    ],
  },
  {
    id: "nexora",
    slug: "nexora",
    name: "Nexora",
    description:
      "A Discord role-management bot built around set operations - find who has every one of a set of roles, who has either of two, or diff two members' roles directly.",
    category: "backend",
    scale: 2,
    tags: ["JavaScript", "Discord.js", "Node.js", "Express"],
    repoUrl: "https://github.com/gdivecha/Nexora",
    details: [
      {
        title: "Overview",
        text: "Nexora gives Discord moderators three slash commands for querying member roles: /converge finds everyone who has every role in a set (up to 12), /crossrole finds everyone with either of two roles, and /rolediff compares exactly what two members' roles have in common and don't.",
      },
    ],
  },
  {
    id: "apply-bot",
    slug: "apply-bot",
    name: "App.ly",
    description:
      "A Discord bot for posting and tracking job opportunities - every listing becomes a trackable post, with live stats and a leaderboard derived entirely from the channel's own message history.",
    category: "backend",
    scale: 2,
    tags: ["JavaScript", "Discord.js", "Node.js"],
    repoUrl: "https://github.com/gdivecha/App.ly",
    details: [
      {
        title: "Overview",
        text: "App.ly is a job-posting bot for a career-focused Discord server. /postjob shares a listing with an auto-added checkmark reaction that doubles as an \"I applied\" signal, while /stats, /leaderboard, and /rivals re-scan the channel's message history live to derive posting and application stats - no database involved.",
      },
    ],
  },
  {
    id: "food-hub-system",
    slug: "food-hub-system",
    name: "Food Hub System",
    description:
      "A layered Java web app for ordering food online - JSP and Servlets over a MySQL schema, with separate customer and employee roles.",
    category: "full-stack",
    scale: 4,
    tags: ["Java", "JSP", "Servlets", "JDBC", "MySQL"],
    repoUrl: "https://github.com/vishnupan819/FoodHubWebApp",
    details: [
      {
        title: "Overview",
        text: "Built for COE692 with a lab partner, Food Hub System behaves like an online grocery-pickup service: a customer browses a catalog of food items, adds them to a cart, and checks out, while an employee manages the catalog and user accounts on the other side.",
      },
      {
        title: "Architecture",
        text: "Four layers, each only talking to the one below it: GUI (JSP/HTML pages), Business (servlets handling HTTP requests), Assistance (plain data-transfer objects), and Persistence (JDBC-backed CRUD classes) sitting on top of a 4-table MySQL schema - a classic layered enterprise-Java shape, deployed on Apache Tomcat via Maven.",
      },
    ],
  },
  {
    id: "straysafe",
    slug: "straysafe",
    name: "StraySAFE - Missing Pet Tracker System",
    description:
      "A pet-monitoring website for reporting missing pets and tracking them when the community finds them.",
    category: "full-stack",
    scale: 3,
    tags: ["HTML", "CSS", "JavaScript", "Figma", "MATLAB"],
    repoUrl: "https://github.com/gdivecha/WildHacks2-StraySAFE",
    details: [
      {
        title: "Overview",
        text: "Built at WildHacks by a team of four, StraySAFE is a pet-monitoring system that lets an owner report a missing pet and lets anyone in the community who finds a stray report that too - reconnecting pets with their owners instead of relying on scattered flyers and social posts.",
      },
      {
        title: "Why it exists",
        text: "Before writing any code, the team ran statistics in MATLAB on how often pets actually go missing, confirming there was a real, urgent gap worth solving rather than assuming one.",
      },
      {
        title: "How it's built",
        text: "A 12-page HTML/CSS/JavaScript flow - signup, login, a detailed \"report missing\" form (breed, microchip number, last seen location, photo), and a status page - mocked up in Figma first. Accounts and pet reports are stored directly in the browser via localStorage rather than a real backend, a deliberate hackathon-scope tradeoff.",
      },
    ],
  },
  {
    id: "cramers-calculator",
    slug: "cramers-calculator",
    name: "Mini Project: Cramer's Calculator",
    description:
      "A Java + JavaFX calculator that recursively computes the determinant of a square matrix.",
    category: "backend",
    scale: 1,
    tags: ["Java", "JavaFX"],
    details: [
      {
        title: "Overview",
        text: "This project's source code, in my side-project repository on GitHub, contains the Cramer's Calculator I developed using Java and JavaFX. Its functionality centers on a recursive algorithm I built to find the determinant of a given square matrix - a real learning curve right after finishing an Algorithms and Data Structures course, putting recursive-method design to the test.",
      },
    ],
  },
  {
    id: "tamacord",
    slug: "tamacord",
    name: "Tamacord - The New Gen Tamagotchi Simulator",
    description:
      "A Discord virtual pet that simulates hunger, hygiene, and happiness, backed by Google Cloud Storage.",
    category: "backend",
    scale: 2,
    tags: ["Python", "Discord API", "Google Cloud"],
    details: [
      {
        title: "Overview",
        text: "Tamacord is a virtual pet that lets the user perform basic interactions between the owner and itself, using Google's cloud storage platform to give a unique pet to each Discord user. It simulates three needs the user has to manage - hunger, hygiene, and happiness - handled by clicking the relevant buttons.",
      },
    ],
  },
  {
    id: "bookstore-gui",
    slug: "bookstore-gui",
    name: "Building a GUI for a Bookstore Application",
    description:
      "A JavaFX bookstore app with a points-based rewards system, built around three real design patterns: Singleton, Observer, and State.",
    category: "backend",
    scale: 3,
    tags: ["Java", "JavaFX", "Design Patterns", "UML"],
    repoUrl: "https://github.com/gdivecha/Bookstore-App",
    details: [
      {
        title: "Overview",
        text: "As the culmination of COE528 - Object-Oriented Engineering Analysis and Design, this project applied design patterns (Singleton, Observer, State), UML modeling (class and use-case diagrams), and black-box/white-box testing to build a working JavaFX desktop app for a bookstore, as a team effort.",
      },
      {
        title: "How it works",
        text: "An Owner (Singleton) manages a shared Inventory (also a Singleton) of books and a list of Customer accounts. A Customer checks out one of two ways - paying full price and earning loyalty points, or redeeming banked points for a discount - and either path notifies the Inventory as an Observer, rather than reaching into it directly. A Customer's status (Silver or Gold) is its own State-pattern object that flips automatically once their points cross a threshold.",
      },
    ],
  },
  {
    id: "multi-stage-amplifier",
    slug: "multi-stage-amplifier",
    name: "Designing a Multi-stage Amplifier",
    description:
      "A multi-stage transistor amplifier designed and simulated in Multisim to meet a target specification.",
    category: "hardware",
    scale: 2,
    tags: ["Multisim", "Circuit Design"],
    details: [
      {
        title: "Overview",
        text: "The Electronic Circuits I course focused on developing an understanding of semiconductor circuits - diodes (PN junctions), bipolar junction transistors, and MOSFETs, and their uses in current mirrors and amplifiers. The goal of this project was to design a multi-stage amplifier meeting a given specification, requiring extensive knowledge of emitter degeneration, small-signal analysis, CE/CC/CB amplifier stages, load-line analysis, and more.",
      },
    ],
  },
  {
    id: "fully-functioning-microprocessor",
    slug: "fully-functioning-microprocessor",
    name: "Fully-functioning Microprocessor",
    description:
      "A general-purpose microprocessor built in VHDL with an ALU, decoder, latches, and a finite state machine.",
    category: "hardware",
    scale: 3,
    tags: ["VHDL", "Quartus", "Digital Logic"],
    details: [
      {
        title: "Overview",
        text: "Built a general-purpose microprocessor containing an Arithmetic Logic Unit. It uses the functionality of a basic ALU, a decoder, latches, and a finite state machine to perform logical operations and tasks as simple as addition or subtraction.",
      },
    ],
  },
  {
    id: "traffic-light-system",
    slug: "traffic-light-system",
    name: "Replicating a Traffic Light System",
    description:
      "A miniature breadboard traffic light system built around a timer IC and basic circuit logic.",
    category: "hardware",
    scale: 1,
    tags: ["C++", "Circuit Design"],
    details: [
      {
        title: "Overview",
        text: "Developed a miniature traffic light system using a breadboard and other basic circuit components, including a timer and a PIC chip. As an introduction to circuit design with little prior programming knowledge, this project was genuinely challenging - working in a group helped bring innovative solutions to the problems we ran into.",
      },
    ],
  },
];
