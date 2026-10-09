// Single source of truth for everything on the site.
// Work experience mirrors the resume; keep the two in sync when either changes.

export const profile = {
  name: "David Antwi",
  role: "Software Engineer",
  focus: "AI agents · Full-stack products · Robotics autonomy",
  school: "Yale University, EECS, Class of 2028",
  location: "New Haven, CT",
  status: "Open to software engineering internships",
  tagline:
    "I build AI systems and full-stack products that real people use, from a platform running in 30+ countries to the autonomy stack for Yale's Mars rover.",
  email: "david.antwi@yale.edu",
  github: "https://github.com/Alienware2000",
  linkedin: "https://www.linkedin.com/in/david-antwi-b17727205/",
  x: "https://x.com/antwidavid389",
  resume: "/Antwi_David_Resume.pdf",
  resumeImage: "/resume.png",
};

export const stats = [
  { value: "16,000+", label: "partners on a platform I built" },
  { value: "30+", label: "countries using it" },
  { value: "2,500+", label: "delegates on my conference registration platform" },
  { value: "3", label: "hackathon wins in 2026" },
];

export const now = [
  "Software Engineer at BENMP (part-time)",
  "Autonomy Lead, Yale Mars Rover Team",
  "Project Director, Yale AI Association",
];

export const experience = [
  {
    org: "BENMP",
    role: "Software Engineer, Tech Team (AI and Full-Stack)",
    context: "Part-time · International nonprofit, 30+ countries",
    start: "Jul 2026",
    end: "Present",
    active: true,
    bullets: [
      "Built and launched the organization's partner management platform, now holding 16,000+ partners across 30+ countries and used by admins at 97 regional hubs.",
      "Built payment reconciliation for bank and mobile money, plus guardrailed, provider-agnostic WhatsApp automation.",
      "Built a grounded, read-only AI assistant over partner data: code computes every figure, the model only explains it.",
      "Migrated 26,000+ records with zero loss and scaled from 1 to 30+ countries in a month via a data-driven region model.",
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Twilio"],
  },
  {
    org: "Beakr, Inc. (Stealth Startup)",
    role: "Software Engineering Intern",
    context: "AI memory platform for life sciences research · New York, NY",
    start: "May 2026",
    end: "Aug 2026",
    bullets: [
      "Designed and shipped Beakr Interviews, an AI system that finds gaps in a lab's knowledge base, interviews the right researcher by text or voice, and turns their answers into cited wiki entries.",
      "Led the computer-use desktop agent: rebuilt search over 80K+ files, made every answer cite its source file, and got it running reliably on Windows by fixing 35 release-blocking defects (Rust).",
      "Extended the desktop agent to launch and supervise coding agents (Claude Code, Codex) on the user's computer, with explicit approval before each run and a full audit log.",
      "Built five evaluation datasets on agent reliability, memory, and tool use, published to Hugging Face.",
    ],
    stack: ["Rust", "TypeScript", "Python", "Agents", "Evals"],
  },
  {
    org: "SynovAI",
    role: "Software Engineering Intern",
    context: "AI retrosynthesis startup · New Haven, CT · via Yale Helix Fellowship",
    start: "Oct 2025",
    end: "May 2026",
    bullets: [
      "Designed and built a vendor-aware stock filtering feature that shows researchers only routes whose starting materials are purchasable, across 5 vendor catalogs of 2.5M+ compounds.",
      "Built a chemical-safety layer that pulls GHS hazard data from PubChem and flags hazards on each molecule in a route.",
      "Built a self-serve fine-tuning pipeline (PyTorch, QLoRA) covering validation, training, and automated evaluation.",
      "Led a UI/UX overhaul of the researcher platform (React, Next.js), redesigning the settings and results views.",
    ],
    stack: ["Python", "PyTorch", "React", "Next.js"],
  },
  {
    org: "The Faboratory, Yale",
    role: "Undergraduate Research Intern",
    context: "Soft robotics lab · New Haven, CT",
    start: "Aug 2025",
    end: "May 2026",
    bullets: [
      "Worked on smart wearable systems that combine sensors, soft actuators, and machine learning for adaptive motion support.",
      "Wrote the C++ firmware for an upper-body soft exosuit sensing rig: four BNO085 IMUs behind an I2C multiplexer, capacitive touch sensing, a custom quaternion library, and joint-angle estimation.",
    ],
    stack: ["C++", "Embedded", "IMUs", "Sensor fusion"],
  },
];

export const leadership = [
  {
    org: "Yale Mars Rover Team",
    sub: "Yale Undergraduate Robotics",
    role: "Autonomy Lead",
    dates: "Aug 2026 → Now",
    active: true,
    text: "Lead the autonomy team for Yale's University Rover Challenge rover, building navigation, mission logic, and replay tooling in ROS 2.",
  },
  {
    org: "Yale AI Association",
    role: "Project Director",
    dates: "Aug 2026 → Now",
    active: true,
    text: "Run the project teams program that places undergraduates on semester-long teams building applied AI.",
  },
  {
    org: "Yale Model African Union",
    role: "Lead Developer · Committee Chair",
    dates: "Nov 2025 → Now",
    active: true,
    text: "Rebuilt the conference site and built the registration platform (2,500+ delegates and 70+ delegations for YMAU VI), and chaired a 30-delegate committee at the Accra conference.",
  },
  {
    org: "Yale Africa Innovation Symposium",
    role: "Student Ambassador, Tech & AI Innovation Lab",
    dates: "Jan 2026 → Apr 2026",
    text: "Co-led a two-day AI founder simulation that won Best Innovation Lab at YAIS IV.",
  },
  {
    org: "Goldman Sachs",
    role: "Emerging Leaders Series Fellow",
    dates: "Jan 2026 → Apr 2026",
    text: "Built the CAPM engine for Northline, a mutual fund calculator for first-time investors, on a six-person team.",
  },
  {
    org: "Yale Computer Society",
    role: "Software Developer · Catalyst Mentor",
    dates: "Sep 2025 → Now",
    text: "Contribute to the Yale Meals app, and mentored 5 students from their first React project to a deployed build.",
  },
];

// category: ai | product | robotics | game
export const projects = [
  {
    title: "Better Office Hours",
    category: "ai",
    featured: true,
    award: "1st place · YaleAI x SpaceXAI Cursor Build Challenge",
    description:
      "A real-time voice tutor that talks students through concepts and problems while drawing diagrams and equations on a live whiteboard or highlighting their uploaded notes. It gives hints, not answers.",
    highlights: [
      "Custom SVG whiteboard engine with local LaTeX rendering and keyframe animations timed to the agent's speech.",
      "Voice loop with on-device speech detection, ElevenLabs transcription and speech, and interruption-safe turn-taking.",
    ],
    tags: ["Next.js", "TypeScript", "ElevenLabs", "Voice AI"],
    code: "https://github.com/Alienware2000/better-office-hours",
  },
  {
    title: "Intentionality",
    category: "ai",
    featured: true,
    award: "300+ users",
    description:
      "A gamified productivity platform for students: quests, XP, streaks, focus sessions, and friend accountability, with an AI planner grounded in your calendar and coursework.",
    highlights: [
      "AI planner with failover across two LLM providers.",
      "Syncs with Google Calendar and Canvas; row-level security on every table.",
    ],
    tags: ["Next.js", "TypeScript", "Supabase", "LLMs"],
    live: "https://intentionality.io",
    preview: true,
    code: "https://github.com/Alienware2000/intentionality",
  },
  {
    title: "Cloud Coding Agent",
    category: "ai",
    featured: true,
    description:
      "A coding agent in a cloud sandbox that never grades its own homework. It writes a definition of done, builds, then a second agent with fresh context and read-only access tests the running app and shows evidence for every check.",
    highlights: [
      "Screenshots and verdicts are captured and computed by the harness, never by the model.",
      "Built an eval that grades the verifier with ground-truth probes and repeated trials. Its first run caught a real false pass, which I fixed mechanically.",
    ],
    tags: ["TypeScript", "Agents", "Evals", "Sandboxes"],
    live: "https://cloud-coding-agent-tau.vercel.app",
    preview: true,
  },
  {
    title: "BENMP Partner Platform",
    category: "product",
    award: "16,000+ partners · 97 hubs",
    description:
      "The partner management system for an international nonprofit. Hub admins upload spreadsheets through a validating import wizard; the office reconciles giving and messages partners from one console.",
    highlights: [
      "Excel/CSV import wizard with identical client and server validation and per-country phone parsing.",
      "Bank and mobile money statement reconciliation, and a read-only AI assistant that only explains numbers the code computed.",
    ],
    tags: ["Next.js", "Supabase", "PostgreSQL", "Twilio"],
    code: "https://github.com/Alienware2000/benmp-prm",
  },
  {
    title: "Mars Rover Autonomy",
    category: "robotics",
    featured: true,
    description:
      "The autonomy stack for Yale's Mars rover: navigation, a mission coordinator, and the tooling to see what the robot was thinking after every run.",
    highlights: [
      "Table-driven mission state machine with package tests covering its transitions.",
      "Gazebo and Nav2 simulation with Foxglove layouts and MCAP record and replay.",
    ],
    tags: ["ROS 2", "Nav2", "Python", "Gazebo", "Foxglove"],
  },
  {
    title: "Ocura",
    category: "ai",
    award: "2nd place · Google x Yale SOM Build with AI Hackathon",
    description:
      "Smart glasses software for people who are blind or have low vision: a voice-in, voice-out assistant that describes the scene and can keep looking for an object in the background.",
    tags: ["Python", "Vision", "Voice AI"],
  },
  {
    title: "TicketDodge",
    category: "product",
    featured: true,
    award: "Best Use of Cursor · Ramp Builders Cup",
    description: "A map that predicts your odds of getting a parking ticket in New York, built on NYC Open Data.",
    tags: ["Next.js", "Python", "Leaflet", "Open data"],
    live: "https://ticketdodge.vercel.app",
    preview: true,
    code: "https://github.com/Alienware2000/ticketdodge",
  },
  {
    title: "Ember Run",
    category: "game",
    featured: true,
    description:
      "A 2D anime parkour game about flow and momentum. Six characters with distinct kits, three chapters, boss fights, and music synthesized in code.",
    tags: ["Phaser 3", "JavaScript", "WebAudio"],
    live: "https://ember-run.vercel.app",
    preview: true,
  },
  {
    title: "YMAU Registration and Review Desk",
    category: "product",
    description:
      "Conference site, Stripe registration, and a blind-review desk for delegate applications and financial aid. 2,500+ delegates and 70+ delegations signed up for YMAU VI so far.",
    tags: ["Next.js", "Stripe", "PostgreSQL"],
    live: "https://www.yalemodelau.org",
    preview: true,
  },
  {
    title: "YMAU Delegate Training Platform",
    category: "product",
    description:
      "Video training platform for 335+ delegates, with watch-time tracking that merges watched segments so skipping ahead does not count, quizzes, and QR-verifiable certificates.",
    tags: ["Next.js", "Firebase", "TypeScript"],
  },
  {
    title: "HJC Portal",
    category: "product",
    description:
      "A conference logistics portal that replaced spreadsheets: access-code login, three roles, itineraries, an audit log, and PDF/CSV export.",
    tags: ["Next.js", "Supabase"],
    code: "https://github.com/Alienware2000/HJC-Portal",
  },
  {
    title: "African Allied Health Network",
    category: "product",
    description:
      "A private networking platform for an allied healthcare summit community: profiles, a searchable directory, connections, and realtime messaging. Installable as a phone app.",
    tags: ["Next.js", "Supabase", "PWA"],
  },
  {
    title: "Press Archive",
    category: "ai",
    description:
      "A research tool that turns exported news articles into a searchable archive, then uses an LLM to code tone and events, with human-agreement checks.",
    tags: ["Next.js", "PostgreSQL", "Python", "Claude"],
  },
  {
    title: "Northline",
    category: "product",
    description:
      "A mutual fund calculator for first-time investors that forecasts returns with CAPM. Built in the Goldman Sachs Emerging Leaders Series.",
    tags: ["Java", "Spring Boot", "React"],
  },
  {
    title: "Biomedical Research Agent",
    category: "ai",
    description: "A command-line research agent that answers biomedical questions with tools over PubMed, OpenAlex, UniProt, and the Protein Data Bank.",
    tags: ["Python", "Claude", "Tool use"],
    code: "https://github.com/Alienware2000/biomedical-research-agent",
  },
  {
    title: "Game Agents",
    category: "ai",
    description: "Agent loops built from scratch, no frameworks: custom grid worlds, a tool interface, a planner, and an MCP server so any client can play.",
    tags: ["Python", "Agents", "MCP"],
    code: "https://github.com/Alienware2000/game-agents",
  },
  {
    title: "CircleBack",
    category: "ai",
    description: "A voice-first networking CRM: talk about who you met, and it builds a 3D knowledge graph of your network.",
    tags: ["Next.js", "FastAPI", "MongoDB", "ElevenLabs"],
    code: "https://github.com/Alienware2000/CircleBack",
  },
  {
    title: "ExoSense",
    category: "robotics",
    description: "Multi-sensor firmware for calibrating an upper-body soft exosuit: four IMUs, capacitive sensing, and joint-angle estimation on a Feather nRF52840.",
    tags: ["C++", "Embedded", "IMUs"],
    code: "https://github.com/Alienware2000/FaboIMUrig",
  },
  {
    title: "Imitation Learning Agents",
    category: "robotics",
    description: "High school research on teaching simulated agents by imitation instead of slow trial-and-error reinforcement learning. Took it to ISEF.",
    tags: ["Python", "Deep learning", "Simulation"],
  },
  {
    title: "Academic Matcher",
    category: "ai",
    description: "A retrieval tool that matches students to research labs based on what professors actually work on.",
    tags: ["Python", "NLP", "FAISS"],
    code: "https://github.com/Alienware2000/Academic-Matcher",
  },
  {
    title: "Journal.ai",
    category: "ai",
    description: "Voice and written journaling that transcribes entries and turns them into cleaner writing, summaries, and reflections.",
    tags: ["Next.js", "Supabase", "Whisper"],
    code: "https://github.com/Alienware2000/Journal.ai",
  },
];

export const categories = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI & Agents" },
  { id: "product", label: "Products" },
  { id: "robotics", label: "Robotics & Hardware" },
  { id: "game", label: "Games" },
];

// tier: gold = competition wins, silver = fellowships and selections
export const achievements = [
  { tier: "gold", title: "1st Place", event: "YaleAI x SpaceXAI Cursor Build Challenge", year: "2026", detail: "Better Office Hours" },
  { tier: "gold", title: "Best Use of Cursor", event: "Ramp Builders Cup", year: "2026", detail: "TicketDodge" },
  { tier: "gold", title: "2nd Place", event: "Google x Yale SOM Build with AI Hackathon", year: "2026", detail: "Ocura" },
  { tier: "gold", title: "Best Innovation Lab", event: "Yale Africa Innovation Symposium IV", year: "2026", detail: "Tech & AI Lab" },
  { tier: "silver", title: "Catapult Fellow", event: "Prometheus X", year: "2026", detail: "$5,000 grant" },
  { tier: "silver", title: "YC Startup School", event: "Y Combinator", year: "2026", detail: "Selected from 30,000+ applicants" },
  { tier: "silver", title: "Emerging Leaders Series", event: "Goldman Sachs", year: "2026", detail: "Selected fellow" },
  { tier: "silver", title: "Helix Fellow", event: "Yale Helix", year: "2025", detail: "Student-run startup incubator" },
  { tier: "silver", title: "ISEF Finalist", event: "International Science and Engineering Fair", year: "2023", detail: "Imitation learning research" },
  { tier: "silver", title: "Science Champion Award", event: "USAID", year: "2023", detail: "Science for international development" },
  { tier: "silver", title: "Silver Award", event: "Eskom Expo International Science Fair", year: "2021", detail: "Imitation learning research" },
];

export const skills = [
  { title: "Languages", items: ["Python", "Java", "JavaScript/TypeScript", "C++", "C", "Rust"] },
  { title: "Frameworks & Libraries", items: ["React", "Next.js", "React Native", "FastAPI", "Flask", "Spring Boot", "PyTorch", "Anthropic SDK", "ROS 2"] },
  { title: "Tools", items: ["PostgreSQL", "Supabase", "Redis", "Docker", "Git", "CI/CD", "Linux", "Hugging Face", "Claude Code", "Cursor"] },
];

export const education = [
  {
    school: "Yale University",
    degree: "B.S. Electrical Engineering and Computer Science",
    dates: "Expected May 2028",
    detail:
      "Coursework: Data Structures, Systems Programming, Software Engineering, Full-Stack Web, Intro to Machine Learning, Intro to AI, HCI, Linear Algebra, Discrete Math",
  },
  {
    school: "Columbia University in Paris",
    degree: "Summer immersion, Accelerated Intermediate French",
    dates: "Summer 2025",
  },
];

export const about = [
  "I learn by building. Most of what I know about software and AI comes from shipping things: startup internships, platforms for organizations I care about, and hackathon projects built in a weekend.",
  "I care about tools that are useful and honest, like a voice tutor that teaches instead of handing out answers, or an AI assistant that only explains numbers the code already computed.",
  "Outside of work I play a lot of video games, which is why this site looks the way it does, and why I'm making one of my own.",
];

// Order here drives the nav and the 1 to 6 keyboard shortcuts
export const SECTIONS = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "leadership", label: "Leadership" },
  { id: "awards", label: "Awards" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
