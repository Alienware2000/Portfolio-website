// Single source of truth for everything on the site.
import { cases } from "./cases.js";
// Work experience mirrors the resume; keep the two in sync when either changes.
// Experience is ordered by signal (strongest roles first), not by start date.

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
  { value: "16,000+", label: "partners in 30+ countries on a platform I co-built" },
  { value: "4,600+", label: "delegates on a conference registration platform I built" },
  { value: "2", label: "startup software engineering internships" },
  { value: "3", label: "hackathon wins in 2026" },
];

// The hero shows three; every current role is still in Experience, Leadership, and Building now
export const now = [
  "Autonomy Lead, Yale Mars Rover Team",
  "Drone swarm researcher, O'Hern Lab",
  "CTO, Yale Africa Innovation Symposium",
];

export const experience = [
  {
    org: "BENMP",
    caseSlug: "benmp-partner-platform",
    role: "Software Engineer, Tech Team (AI and Full-Stack)",
    context: "Part-time volunteer · International organization, 30+ countries",
    start: "Jul 2026",
    end: "Present",
    active: true,
    bullets: [
      "Co-built and launched the organization's partner management platform, now holding 16,000+ partners across 30+ countries and used by admins at 117 regional hubs (TypeScript, Next.js, Supabase).",
      "Built mobile money payment reconciliation, plus guardrailed, provider-agnostic WhatsApp automation.",
      "Built a grounded, read-only AI assistant over partner data: code computes every figure, the model only explains it.",
      "Archived 26,000+ legacy records with zero loss, then took the hub platform from Ghana to 30+ countries in a month.",
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "WhatsApp/SMS"],
  },
  {
    org: "Beakr, Inc. (Stealth Startup)",
    role: "Software Engineering Intern",
    context: "AI memory platform for life sciences research · New York, NY",
    start: "May 2026",
    end: "Aug 2026",
    bullets: [
      "Designed and shipped Beakr Interviews, an AI system that finds gaps in a lab's knowledge base, interviews the right researcher by text or voice, and turns answers into cited wiki entries (Python, Postgres, Redis Streams, per-organization feature flags).",
      "Led the computer-use desktop agent: rebuilt search over 80K+ files, made every answer cite its source file, and got it running reliably on Windows by fixing 35 release-blocking defects (Rust).",
      "Extended the desktop agent to launch and supervise coding agents (Claude Code, Codex) on the user's computer, with explicit approval before each run and a full audit log.",
      "Built the agent's write access to 19 external services, with scoped permissions and user confirmation before every action.",
    ],
    stack: ["Rust", "Python", "Postgres", "Redis Streams", "Agents"],
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
    org: "Yale Mars Rover Team",
    caseSlug: "mars-rover-autonomy",
    role: "Autonomy Lead",
    context: "University Rover Challenge 2027 · Yale Undergraduate Robotics",
    start: "Sep 2026",
    end: "Present",
    active: true,
    bullets: [
      "Built the ROS 2 mission state machine for both autonomy missions, with command guards, cancellation, timeouts, and stale-result rejection, in a package with 91 tests (Python).",
      "Integrated missions with Nav2 navigation and fused localization in Gazebo, and fixed a GPS initialization race that could corrupt position estimates.",
      "Set up ARM64 and x86-64 Docker environments and GitHub Actions build and test pipelines for the team.",
    ],
    stack: ["ROS 2", "Python", "Nav2", "Gazebo", "Docker", "GitHub Actions"],
  },
  {
    org: "O'Hern Lab, Yale Mechanical Engineering",
    role: "Undergraduate Researcher",
    caseSlug: "drone-swarm",
    context: "Industry-sponsored drone swarm project · New Haven, CT",
    start: "Sep 2026",
    end: "Present",
    active: true,
    bullets: [
      "Built the swarm's simulation test bench in Python on Crazyflow (JAX + MuJoCo), with plug-in slots so any controller or planner runs through the same tests.",
      "Implemented and compared A*, potential-field and EGO-Planner avoidance across 3 obstacle worlds, then added multi-drone flight with shared plans that took a 4-drone swap from colliding to no contact.",
      "Traced an 8 cm hover error to a firmware thrust constant over-driving the motors by 1.61x, built Sim Lab to replay and re-run every test flight, and wrote a 39-paper sim-to-real review. Next: reinforcement learning in JAX.",
    ],
    stack: ["Python", "JAX", "MuJoCo", "Crazyflie", "Path planning"],
  },
  {
    org: "Saxena Lab, Yale",
    role: "Research Assistant",
    context: "Computational neuroscience, Wu Tsai Institute · New Haven, CT",
    start: "Oct 2026",
    end: "Present",
    active: true,
    bullets: [
      "Generalizing muSim, the lab's reinforcement-learning controllers for MuJoCo musculoskeletal models, to new bodies, and making it modular and faster to train.",
    ],
    stack: ["Python", "PyTorch", "MuJoCo", "Reinforcement learning"],
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
    text: "Rebuilt the conference site and built the registration platform (4,600+ delegates and 116 delegations for YMAU VI), and chaired a 30-delegate committee at the Accra conference.",
  },
  {
    org: "Yale Africa Innovation Symposium",
    role: "Chief Technology Officer",
    caseSlug: "yais-platform",
    dates: "Sep 2026 → Now",
    active: true,
    text: "Lead technology for YAIS V: built the new website and the event platform, with verified registration, Stripe checkout, QR passes and a staff check-in desk, in private testing before launch. Before that, as Student Ambassador for the Tech & AI Innovation Lab, co-led the AI founder simulation that won Best Innovation Lab at YAIS IV.",
  },
  {
    org: "Goldman Sachs",
    role: "Emerging Leaders Series Fellow",
    dates: "Jan 2026 → Apr 2026",
    text: "Built the CAPM engine for Northline, a mutual fund calculator for first-time investors.",
  },
  {
    org: "Yale Computer Society",
    role: "Software Developer · Catalyst Mentor",
    dates: "Sep 2025 → Now",
    text: "Contribute to the Yale Meals app, and mentored 5 students from their first React project to a deployed build.",
  },
];

// category: ai | product | robotics | game
// Case-study projects first; the rest are listed strongest first within each year ("More projects" keeps this order).
export const projects = [
  {
    title: "Better Office Hours",
    slug: "better-office-hours",
    year: 2026,
    cover: { replica: "OfficeHours", note: "The hosted app is only switched on for demos, so this copy plays example lessons through the same interface.", scene: "board", host: "better office hours · voice session" },
    case: cases["better-office-hours"],
    featured: 4,
    category: "ai",
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
    slug: "intentionality",
    year: 2025,
    cover: { replica: "Intentionality", note: "Users' accounts are private, so this copy of the logged-in app runs on sample data. The live site is linked above.", img: "/work/intentionality.jpg", alt: "Intentionality landing page", host: "intentionality.io · command center" },
    case: cases["intentionality"],
    featured: 8,
    category: "ai",
    metric: "300+ users",
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
    slug: "cloud-coding-agent",
    year: 2026,
    cover: { replica: "CloudAgent", note: "The real app sits behind a login and makes paid model calls, so this copy plays example tasks through the same interface.", scene: "agent", host: "cloud-coding-agent" },
    case: cases["cloud-coding-agent"],
    featured: 2,
    category: "ai",
    description:
      "A coding agent in a cloud sandbox that never grades its own homework. It writes a definition of done, builds, then a second agent with fresh context and read-only access tests the running app and shows evidence for every check.",
    highlights: [
      "Screenshots and verdicts are captured and computed by the harness, never by the model.",
      "Built an eval that grades the verifier with ground-truth probes and repeated trials. Its first run caught a real false pass, which I fixed mechanically.",
    ],
    tags: ["TypeScript", "Agents", "Evals", "Sandboxes"],
  },
  {
    title: "BENMP Partner Platform",
    slug: "benmp-partner-platform",
    year: 2026,
    cover: { replica: "PartnerImport", note: "The real platform holds 16,000+ people's records and phone numbers, so this copy of its interface runs on sample data.", scene: "hubs", host: "benmp partners · hub workspace" },
    case: cases["benmp-partner-platform"],
    featured: 1,
    category: "product",
    metric: "16,000+ partners · 117 hubs",
    description:
      "The partner management system for an international organization. Hub admins upload spreadsheets through a validating import wizard; the office reconciles giving and messages partners from one console.",
    highlights: [
      "Excel/CSV import wizard with identical client and server validation and per-country phone parsing.",
      "Bank and mobile money statement reconciliation, and a read-only AI assistant that only explains numbers the code computed.",
    ],
    tags: ["Next.js", "TypeScript", "Supabase", "PostgreSQL"],
    code: "https://github.com/Alienware2000/benmp-prm",
  },
  {
    title: "Mars Rover Autonomy",
    slug: "mars-rover-autonomy",
    year: 2026,
    cover: { replica: "RoverMission", note: "The mission console runs on the team's machines, so this copy rebuilds it in the browser and runs a JavaScript port of the real state machine.", scene: "rover", host: "foxglove · rover27 mission observation (simulation)" },
    case: cases["mars-rover-autonomy"],
    featured: 5,
    category: "robotics",
    description:
      "Autonomy software for Yale's Mars rover: a mission coordinator that drives Nav2 navigation, tested in Gazebo simulation.",
    highlights: [
      "Mission state machine for both autonomy missions with guards, cancellation, timeouts, and 91 tests.",
      "Nav2 navigation on fused localization in Gazebo, plus a fix for a GPS startup race in localization.",
    ],
    tags: ["ROS 2", "Nav2", "Python", "Gazebo", "Docker"],
  },
  {
    title: "TicketDodge",
    slug: "ticketdodge",
    year: 2026,
    cover: { img: "/work/ticketdodge.jpg", alt: "TicketDodge map showing ticket risk near Broadway" },
    case: cases["ticketdodge"],
    featured: 10,
    category: "product",
    award: "Best Use of Cursor · Ramp Builders Cup",
    description: "A map that scores parking-ticket risk street by street from NYC Open Data, for as long as you plan to park.",
    tags: ["Next.js", "TypeScript", "Leaflet", "Open data"],
    live: "https://ticketdodge.vercel.app",
    preview: true,
    code: "https://github.com/Alienware2000/ticketdodge",
  },
  {
    title: "Ember Run",
    slug: "ember-run",
    year: 2026,
    cover: { img: "/work/emberrun.jpg", alt: "Ember Run character select screen" },
    case: cases["ember-run"],
    featured: 9,
    category: "game",
    description:
      "A 2D anime parkour game about flow and momentum. Six characters with distinct kits, three chapters, boss fights, and music synthesized in code.",
    tags: ["Phaser 3", "JavaScript", "WebAudio"],
    live: "https://ember-run.vercel.app",
    preview: true,
  },
  {
    title: "YMAU Registration and Review Desk",
    slug: "ymau-registration-desk",
    year: 2026,
    cover: { replica: "RegistrationDesk", note: "The real desk holds delegates' personal data, so this copy of it runs on sample data.", img: "/work/ymau.jpg", alt: "Yale Model African Union VI homepage", host: "secretariat desk · yalemodelau.org" },
    case: cases["ymau-registration-desk"],
    featured: 7,
    category: "product",
    description:
      "Conference site, Stripe registration, and a blind-review desk for delegate applications and financial aid. 4,600+ delegates and 116 delegations signed up for YMAU VI so far.",
    tags: ["Next.js", "Stripe", "PostgreSQL"],
    live: "https://www.yalemodelau.org",
    preview: true,
  },
  {
    title: "Crazyflie Drone Swarm",
    slug: "drone-swarm",
    year: 2026,
    cover: { video: "/videos/drone/squad-pillars.mp4", img: "/videos/drone/squad-pillars.jpg", alt: "Four simulated Crazyflie drones flying past a field of pillars", host: "sim lab · 4 drones through pillars (simulation)" },
    case: cases["drone-swarm"],
    featured: 6,
    category: "robotics",
    metric: "O'Hern Lab · Yale",
    description:
      "The simulation test bench for an O'Hern Lab Crazyflie swarm. One or several drones fly through obstacle worlds while avoidance methods from published papers are compared: A* and EGO-Planner cleared all 3 worlds without contact, and shared plans took a 4-drone swap from colliding to clean. A local web app replays and re-runs every test. Next: reinforcement learning in JAX and the first real Crazyflies.",
    tags: ["Python", "JAX", "MuJoCo", "Crazyflie", "Path planning"],
  },
  {
    title: "Ocura",
    year: 2026,
    category: "ai",
    award: "2nd place · Google x Yale SOM Build with AI Hackathon",
    description:
      "Smart glasses software for people who are blind or have low vision: a voice-in, voice-out assistant that describes the scene and can keep looking for an object in the background. I built the vision adapter, streaming speech, and the background search that can interrupt itself and resume.",
    tags: ["Python", "Gemini", "Streaming TTS", "Voice AI"],
  },
  {
    title: "YAIS Platform",
    slug: "yais-platform",
    year: 2026,
    cover: { scene: "tickets", host: "yais v · ticket flow" },
    case: cases["yais-platform"],
    featured: 3,
    category: "product",
    metric: "In private testing",
    description:
      "Website and event platform I built for the Yale Africa Innovation Symposium. Registration with an emailed code, Stripe checkout, one QR pass per attendee, partial refunds and a phone check-in scanner, in private testing before launch. Duplicate or missed payment notices still produce exactly one ticket and one email.",
    tags: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Stripe"],
  },
  {
    title: "Press Archive",
    year: 2026,
    category: "ai",
    description:
      "A research tool that turns exported news articles into a searchable archive, then uses an LLM to code tone and events, with human-agreement checks.",
    tags: ["Next.js", "PostgreSQL", "Python", "Claude"],
  },
  {
    title: "Northline",
    year: 2026,
    category: "product",
    description:
      "A mutual fund calculator for first-time investors that forecasts returns with CAPM, built in the Goldman Sachs Emerging Leaders Series. I wrote the CAPM API, fund risk matching, and the dashboard rewrite.",
    tags: ["Java", "Spring Boot", "React"],
    code: "https://github.com/Goldman-Sachs-Emerging-Leaders-Group2/Goldman-Emerging-Leaders-Group2",
  },
  {
    title: "African Allied Health Network",
    year: 2026,
    category: "product",
    description:
      "A private networking platform for an allied healthcare summit community: profiles, a searchable directory, connections, and realtime messaging. Installable as a phone app.",
    tags: ["Next.js", "Supabase", "PWA"],
  },
  {
    title: "HJC Portal",
    year: 2026,
    category: "product",
    description:
      "A conference logistics portal that replaced spreadsheets: access-code login, three roles, itineraries, an audit log, and PDF/CSV export.",
    tags: ["Next.js", "Supabase"],
    code: "https://github.com/Alienware2000/HJC-Portal",
  },
  {
    title: "YArt Match",
    year: 2026,
    category: "product",
    description: "A swipe-and-match app over the Yale Art Gallery collection. I built the profile page and stats API, the era chart, and a frontend redesign.",
    tags: ["Django", "React", "REST API"],
  },
  {
    title: "Biomedical Research Agent",
    year: 2026,
    category: "ai",
    description: "A command-line research agent that answers biomedical questions with tools over PubMed, OpenAlex, UniProt, and the Protein Data Bank.",
    tags: ["Python", "Claude", "Tool use"],
    code: "https://github.com/Alienware2000/biomedical-research-agent",
  },
  {
    title: "CircleBack",
    year: 2026,
    category: "ai",
    description: "A voice-first networking CRM: talk about who you met, and it builds a 3D knowledge graph of your network.",
    tags: ["Next.js", "FastAPI", "MongoDB", "ElevenLabs"],
    code: "https://github.com/Alienware2000/CircleBack",
  },
  {
    title: "YMAU Delegate Training Platform",
    year: 2026,
    category: "product",
    description:
      "Video training platform for 335+ delegates, with watch-time tracking that merges watched segments so skipping ahead does not count, quizzes, and QR-verifiable certificates.",
    tags: ["Next.js", "Firebase", "TypeScript"],
    code: "https://github.com/dennisephraim/ymau-training-platform",
  },
  {
    title: "EESA Feast 2026",
    year: 2025,
    category: "product",
    description: "The website for a national student conference, with patterns drawn in SVG from woven textile designs.",
    tags: ["Next.js", "Tailwind CSS", "SVG"],
    live: "https://eesa-feast.vercel.app",
  },
  {
    title: "Game Agents",
    year: 2025,
    category: "ai",
    description: "Agent loops built from scratch, no frameworks: custom grid worlds, a tool interface, a planner, and an MCP server so any client can play.",
    tags: ["Python", "Agents", "MCP"],
    code: "https://github.com/Alienware2000/game-agents",
  },
  {
    title: "ExoSense",
    year: 2025,
    category: "robotics",
    description: "Multi-sensor firmware for calibrating an upper-body soft exosuit: four IMUs, capacitive sensing, and joint-angle estimation on a Feather nRF52840.",
    tags: ["C++", "Embedded", "IMUs"],
    code: "https://github.com/Alienware2000/FaboIMUrig",
  },
  {
    title: "Academic Matcher",
    year: 2025,
    category: "ai",
    description: "A retrieval tool that matches students to research labs based on what professors actually work on.",
    tags: ["Python", "NLP", "FAISS"],
    code: "https://github.com/Alienware2000/Academic-Matcher",
  },
  {
    title: "Journal.ai",
    year: 2025,
    category: "ai",
    description: "Voice and written journaling that transcribes entries and turns them into cleaner writing, summaries, and reflections.",
    tags: ["Next.js", "Supabase", "Whisper"],
    code: "https://github.com/Alienware2000/Journal.ai",
  },
  {
    title: "Imitation Learning Agents",
    year: 2023,
    category: "robotics",
    description: "High school research on teaching simulated agents by imitation instead of slow trial-and-error reinforcement learning. Took it to ISEF.",
    tags: ["Python", "Deep learning", "Simulation"],
  },
];

// "Building now": what I'm working on right now, one line per project (not a changelog).
// Update the list and `updated` whenever the work changes; agents read `updated` as "current as of".
export const updated = "2026-10-27";
export const building = [
  { tag: "Drone swarm", slug: "drone-swarm", text: "Squads of four drones through obstacle worlds with re-planning, then reinforcement learning in JAX and the first real Crazyflies." },
  { tag: "YAIS", slug: "yais-platform", text: "Getting YAIS V ready to launch: registration, Stripe checkout, QR passes and the staff check-in desk are in private testing." },
  { tag: "YMAU", slug: "ymau-registration-desk", text: "Running the YMAU VI registration platform as 4,600+ delegates sign up: payments, financial aid review, and keeping the database fast under load." },
  { tag: "Mars Rover", slug: "mars-rover-autonomy", text: "The mission coordinator and simulation tooling for both University Rover Challenge 2027 autonomy missions." },
  { tag: "BENMP", slug: "benmp-partner-platform", text: "Office tools for the partner platform as it grows past 117 hubs, starting with one admin view across every region." },
  { tag: "muSim", org: "Saxena Lab", text: "Generalizing the lab's reinforcement-learning controllers for musculoskeletal models to new bodies, and making the code modular and faster to train." },
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
];

export const about = [
  "I learn by building. Most of what I know about software and AI comes from shipping things: startup internships, platforms for organizations I care about, and hackathon projects built in a weekend.",
  "I care about tools that are useful and honest, like a voice tutor that teaches instead of handing out answers, or an AI assistant that only explains numbers the code already computed.",
  "Outside of work I play a lot of video games, which is why this site looks the way it does, and why I'm making one of my own.",
];

// Order here drives the nav and the 1 to 6 keyboard shortcuts
// `primary` items stay in the nav on small screens; the rest appear from laptop width up
export const SECTIONS = [
  { id: "work", label: "Work", primary: true },
  { id: "now", label: "Now" },
  { id: "experience", label: "Experience", primary: true },
  { id: "projects", label: "Projects", primary: true },
  { id: "leadership", label: "Leadership" },
  { id: "awards", label: "Awards" },
  { id: "skills", label: "About", primary: true },
];

// Projects with a case study, in "Selected work" order; the rest follow so prev/next can reach them
export const caseStudies = projects
  .filter((p) => p.case)
  .sort((a, b) => (a.featured ?? 99) - (b.featured ?? 99));
