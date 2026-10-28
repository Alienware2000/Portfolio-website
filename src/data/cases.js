// Case studies for the projects in "Selected work", keyed by project slug.
// Each one follows the same shape so a reader can jump straight to what they care about:
// scope (who did what, when), problem, built, hardPart, results, arch (diagram), decisions.
// Only claim what the repo shows, and only what David built.

export const cases = {
  "benmp-partner-platform": {
    oneLiner: "The partner management platform an international organization runs on: admins at 117 hubs upload, clean, and manage partner records across 30+ countries.",
    scope: "Software Engineer (part-time) · Jul 2026 to now",
    problem:
      "BENMP's partners span 30+ countries, but their records lived in spreadsheets kept by hub leaders, with inconsistent names, phone formats, and church lists. The office could not reliably tell who had given, reach partners, or trust the legacy data.",
    built: [
      "The hub portal and a four-step Excel/CSV import wizard: pick columns so headers never matter, fix flagged rows in place, and keep an audit trail of the original file.",
      "Validation that runs identically in the browser and on the server: branch matching against each hub's approved list, country-aware WhatsApp parsing, and a name-and-number identity rule so nobody is overwritten on a name alone.",
      "A data-driven region model (region, hub, branch, partner): adding a country is a seed entry plus an idempotent SQL migration, with no deploy.",
      "Phone-based payment reconciliation, WhatsApp and SMS sending behind swappable provider adapters with preview and explicit confirm, and a read-only assistant where code computes every figure and the model only explains it.",
    ],
    hardPart:
      "Getting clean data from more than a hundred non-technical admins who type phone numbers the way people in their own country do. The first Malawi upload failed row after row because numbers were read as Ghanaian, so a local number could silently become a wrong +233 number. I made the hub's country drive phone parsing, accepted every shape Excel produces (stripped '+', dropped leading 0), and ran the exact same checks in the browser preview and on save, so admins fix rows in place and nothing invalid is ever written.",
    results: [
      { value: "16,000+", label: "partners on the platform" },
      { value: "30+", label: "countries" },
      { value: "117", label: "regional hubs using it" },
      { value: "26,000+", label: "legacy records archived with zero loss" },
    ],
    decisions: [
      "Regions as data, not code: a new country is a seed entry and an idempotent SQL migration, so the platform grew from Ghana to 30+ countries without a deploy per country.",
      "A partner is matched on name and number together, never name alone, so two people with the same name can't overwrite each other.",
      "Sending goes through swappable provider adapters with a preview, an explicit confirm, and an allowlist, so switching WhatsApp providers never changes how a send is approved.",
    ],
    arch: {
      nodes: [
        { id: "sheets", label: "Hub spreadsheets", tech: "Excel / CSV" },
        { id: "wizard", label: "Import wizard", tech: "Next.js", mine: true },
        { id: "rules", label: "Shared validation", tech: "browser + server", mine: true },
        { id: "db", label: "Partner database", tech: "Supabase Postgres" },
        { id: "console", label: "Office console", tech: "reconciliation", mine: true },
        { id: "msg", label: "Messaging adapters", tech: "WhatsApp / SMS", mine: true },
        { id: "ask", label: "Read-only assistant", tech: "code computes", mine: true },
      ],
      edges: [
        { from: "sheets", to: "wizard", label: "upload" },
        { from: "wizard", to: "rules", label: "check rows" },
        { from: "rules", to: "db", label: "clean rows" },
        { from: "db", to: "console", label: "statements" },
        { from: "console", to: "msg", label: "send" },
        { from: "db", to: "ask", label: "figures" },
      ],
      caption: "Invariant: one set of rules decides what is valid, so the preview an admin sees is exactly what gets saved.",
    },
  },

  "cloud-coding-agent": {
    oneLiner: "A cloud coding agent that never grades its own homework: a separate, read-only verifier tests the running app and shows evidence for every check.",
    scope: "Solo, on top of an open-source agent scaffold · Jul 2026",
    problem:
      "Coding agents often say a task is done when the app does not actually work, so people end up re-checking everything themselves. Trust needs proof the model cannot fake, not a confident summary.",
    built: [
      "A turn pipeline: a fresh model call writes a browser-checkable definition of done, the builder works in an E2B cloud sandbox, then a verifier with fresh context and read-only tools tests the running app.",
      "Trust lives in the harness, not the model: screenshots are captured server-side at the moment of each assertion, verdicts are computed by code, and 'unable to verify' is an honest outcome.",
      "Fix and re-verify loops: a fix gets the failing checks plus the verifier's evidence, then every item is re-checked, because fixes can break things that passed before.",
      "A small eval that grades the verifier itself, with ground-truth HTTP probes, repeated trials, a no-verify baseline, and fault injection.",
    ],
    hardPart:
      "Making a 'verified' badge mean something when the verifier is itself a model. I moved every trust-bearing output into code, then built an eval that fact-checks the verifier with HTTP probes independent of both agents. Its first full run caught a false pass: after the app server was killed, the browser cache still served the page, so the verifier saw a working app that was not there. I fixed it mechanically with cache-busting navigation, and the re-run scored 8 of 8 verdicts correct with zero false passes.",
    results: [
      { value: "1", label: "real false pass caught by the eval on its first run" },
      { value: "8 / 8", label: "verdicts correct after the fix" },
      { value: "0", label: "false passes on the re-run" },
      { value: "1 day", label: "to build the verify loop and eval" },
    ],
    decisions: [
      "Verdicts are computed by code from recorded checks, not written by a model, so a model can't talk its way into a pass.",
      "The verifier starts with fresh context and read-only tools instead of sharing the builder's, so it can't inherit the builder's assumptions or quietly fix things.",
      "'Unable to verify' is a real outcome, not a forced pass or fail, so an honest gap is never dressed up as a result.",
    ],
    arch: {
      nodes: [
        { id: "ui", label: "Chat UI", tech: "Next.js" },
        { id: "route", label: "Turn orchestrator", tech: "streamed route", mine: true },
        { id: "plan", label: "Definition of done", tech: "fresh model call", mine: true },
        { id: "builder", label: "Builder agent", tech: "Claude" },
        { id: "verifier", label: "Verifier agent", tech: "read-only", mine: true },
        { id: "sandbox", label: "Running app", tech: "E2B sandbox" },
        { id: "db", label: "Evidence + traces", tech: "Neon Postgres", mine: true },
      ],
      edges: [
        { from: "ui", to: "route", label: "task" },
        { from: "route", to: "plan", label: "checklist" },
        { from: "route", to: "builder", label: "build" },
        { from: "route", to: "verifier", label: "verify" },
        { from: "builder", to: "sandbox", label: "write, run" },
        { from: "verifier", to: "sandbox", label: "browser checks" },
        { from: "route", to: "db", label: "verdicts" },
      ],
      caption: "Tradeoff: verification makes every turn slower, but a pass now means something because no model writes its own verdict.",
    },
  },

  "better-office-hours": {
    oneLiner: "A voice tutor that teaches on a live whiteboard and the student's own notes, and gives hints instead of answers.",
    scope: "I built the voice loop, the whiteboard engine, and the workspace · Sep to Oct 2026",
    problem:
      "Office hours are crowded and intimidating, and generic AI tutors tend to solve the problem instead of teaching it. A 2025 PNAS field study found unguarded AI help raised practice scores but cut later unassisted exam performance by 17 percent.",
    built: [
      "A custom SVG whiteboard engine: progressive handwriting reveal, LaTeX typeset locally, generated animations with play, pause and scrub, and separate tutor and student ink layers.",
      "The voice loop: on-device speech detection, ElevenLabs transcription and speech, and tap-to-interrupt that stops speech and freezes the animation without losing the board.",
      "A PDF desk where the tutor points and highlights, and sees page and board snapshots that include the student's own marks.",
      "Two model lanes: a fast model acknowledges and routes, and a reasoning model returns a teaching move plus up to three narrated drawing beats, with guards that hold back answers on graded work.",
    ],
    hardPart:
      "Keeping generated drawings in step with a voice that is synthesized, buffered, and interruptible. Model output streams faster than speech plays, so drawing immediately would show the picture (or the answer) before the tutor said it. I queued each visual command behind the words before it and released it only when that audio actually started playing. A playback epoch means an interruption cancels every pending visual, and late results are ignored.",
    results: [
      { value: "1st", label: "place, YaleAI x SpaceXAI Cursor Build Challenge" },
      { value: "2 days", label: "to the winning prototype" },
    ],
    decisions: [
      "Drawings are released by the audio's own playing event, not by timers, because synthesized speech starts and buffers unpredictably.",
      "Two model lanes: a fast model acknowledges right away while a reasoning model plans the lesson, so the tutor never sits silent.",
      "Math is typeset locally with a pinned MathJax build instead of a CDN, so the board renders the same way every time.",
    ],
    arch: {
      nodes: [
        { id: "mic", label: "Mic + speech detection", tech: "Silero VAD", mine: true },
        { id: "stt", label: "Transcription", tech: "ElevenLabs" },
        { id: "route", label: "Agent route", tech: "Next.js", mine: true },
        { id: "fast", label: "Fast lane", tech: "route + acknowledge" },
        { id: "deep", label: "Reasoning lane", tech: "teaching beats" },
        { id: "queue", label: "Speech-synced queue", tech: "ElevenLabs TTS", mine: true },
        { id: "desk", label: "Whiteboard + PDF desk", tech: "SVG, PDF.js", mine: true },
      ],
      edges: [
        { from: "mic", to: "stt", label: "utterance" },
        { from: "stt", to: "route", label: "transcript" },
        { from: "route", to: "fast" },
        { from: "fast", to: "queue", label: "quick reply" },
        { from: "route", to: "deep", label: "lesson" },
        { from: "deep", to: "queue", label: "speech + visuals" },
        { from: "queue", to: "desk", label: "on playback" },
      ],
      caption: "Invariant: nothing appears on the board before the tutor says it.",
    },
  },

  "mars-rover-autonomy": {
    oneLiner: "Autonomy software for Yale's Mars rover: a mission coordinator that drives Nav2 navigation, tested in Gazebo simulation.",
    scope: "Autonomy Lead · Yale Mars Rover Team · Sep 2026 to now · tested in Gazebo simulation",
    problem:
      "For University Rover Challenge 2027 the rover has to run two autonomy missions on its own. Commands can arrive at the wrong moment, navigation can fail or be cancelled, and old results can show up late. A new student team also needed a shared, reproducible ROS environment before anyone could test autonomy at all.",
    built: [
      "A ROS 2 mission coordinator for both missions: an explicit transition table, command guards, stop, abort, timeout and human takeover, and rejection of stale results, with 91 package tests.",
      "A Nav2 adapter that reports arrival only on successful navigation and waits for a cancel to finish before sending a replacement goal.",
      "A diagnosis and fix for a localization startup race (GPS arriving before the datum was set): a pinned, patch-verified build with a regression test that forces GPS to arrive first.",
      "Team infrastructure, merged: a multi-architecture ROS Jazzy dev container (ARM64 and x86-64), GitHub Actions build and test on every PR, and architecture docs.",
    ],
    hardPart:
      "A localization bug that only showed up sometimes. In fresh simulation runs the fused position of a rover sitting still could start kilometres away, and a successful retry hid the bug. I traced it to robot_localization: a GPS fix that arrived before the datum was set got projected from the default origin and cached. I pinned the package with a five-line guard, made the installer verify the exact revision and patch, and added a test that forces GPS to arrive first. Every startup position then stayed within 1 m of the origin.",
    results: [
      { value: "91", label: "mission coordinator tests, CI green" },
      { value: "0.11 m", label: "goal error on a simulated Nav2 run with fused localization" },
      { value: "< 1 m", label: "startup error after the GPS race fix (was km)" },
      { value: "9", label: "infrastructure PRs merged to main" },
    ],
    decisions: [
      "An explicit transition table instead of nested conditionals, so every state change is written down once and tested.",
      "Every result carries the goal it belongs to, and anything for an old goal is ignored, so a late answer can't end the wrong mission.",
      "A replacement goal waits for the cancel to finish, so Nav2 is never driving toward two goals at once.",
    ],
    arch: {
      nodes: [
        { id: "cmd", label: "Mission commands", tech: "ROS topic / CLI" },
        { id: "coord", label: "Mission coordinator", tech: "state machine", mine: true },
        { id: "adapter", label: "Nav2 adapter", tech: "goals, cancel", mine: true },
        { id: "nav2", label: "Nav2", tech: "NavigateToPose" },
        { id: "sim", label: "Simulated rover", tech: "Gazebo" },
        { id: "ekf", label: "Fused localization", tech: "wheel + GPS EKF" },
      ],
      edges: [
        { from: "cmd", to: "coord", label: "start, stop" },
        { from: "coord", to: "adapter", label: "mission step" },
        { from: "adapter", to: "nav2", label: "map goal" },
        { from: "nav2", to: "sim", label: "velocity" },
        { from: "sim", to: "ekf", label: "odom, GPS" },
      ],
      caption: "The coordinator only trusts results tagged with the current goal, so a late answer from a cancelled goal can never end a mission. I integrated the coordinator with fused localization and fixed its startup race.",
    },
  },

  "ymau-registration-desk": {
    oneLiner: "Conference site, Stripe registration, and a staff review desk for Yale Model African Union's sixth conference in Addis Ababa.",
    scope: "Lead Developer · Aug 2026 to now",
    problem:
      "YMAU VI takes applications from thousands of young delegates, with fees, financial aid, documents, and a cap on paid places. The Secretariat needed one system to register and charge delegates, review aid fairly, and never double-sell a place or mark someone paid by mistake.",
    built: [
      "A rebuilt yalemodelau.org (with French and Amharic pages) and a seven-step applicant portal with autosave, document uploads, and email sign-in links.",
      "Stripe Checkout for single and whole-delegation payments, with webhook reconciliation, idempotency keys, refund and dispute flags, and a guard that turns payments off if Stripe's mode and the database disagree.",
      "A Secretariat desk with three roles, an audit log, and financial aid review where an officer sees other reviewers' scores only after saving their own, so nobody anchors on someone else's number.",
      "Row-level security on every table, and database traffic cuts when free-tier limits started blocking uploads.",
    ],
    hardPart:
      "Selling a capped number of places correctly across serverless instances, when one delegate can pay for a whole group and Stripe responses can get lost. Every payment, submission and aid write takes one transaction-scoped Postgres row lock first. A group checkout reserves all its places at once or fails as a whole, and a checkout only expires when Stripe confirms it, never on the app's own clock. I tested it by running the real migration in an in-memory Postgres, with two people racing for the last place and duplicate or out-of-order webhooks.",
    results: [
      { value: "4,600+", label: "delegates signed up for YMAU VI" },
      { value: "116", label: "delegations" },
      { value: "3", label: "languages on the site" },
    ],
    decisions: [
      "One transaction-scoped Postgres row lock guards capacity instead of counters checked in app code, so concurrent checkouts can't oversell a place.",
      "A checkout expires only when Stripe confirms it, never on the app's own clock, so a slow payment can't lose its reserved place.",
      "Payments switch off automatically if Stripe's test or live mode disagrees with the database, so test charges can never mark a real delegate paid.",
    ],
    arch: {
      nodes: [
        { id: "auth", label: "Email sign-in", tech: "Auth.js + Resend" },
        { id: "portal", label: "Applicant portal", tech: "Next.js", mine: true },
        { id: "stripe", label: "Checkout + webhooks", tech: "Stripe", mine: true },
        { id: "db", label: "Database + capacity lock", tech: "Postgres, Drizzle", mine: true },
        { id: "storage", label: "Documents", tech: "Supabase Storage" },
        { id: "desk", label: "Secretariat desk", tech: "roles, aid review", mine: true },
      ],
      edges: [
        { from: "auth", to: "portal", label: "sign in" },
        { from: "portal", to: "stripe", label: "reserve, pay" },
        { from: "portal", to: "storage", label: "uploads" },
        { from: "stripe", to: "db", label: "reconcile" },
        { from: "desk", to: "db", label: "decisions" },
      ],
      caption: "Invariant: a paid place exists only after Stripe confirms it, and only one writer can hold the capacity lock at a time.",
    },
  },

  intentionality: {
    oneLiner: "A productivity app for students that turns coursework into quests, with streaks, focus sessions, friends, and an AI planner.",
    scope: "Solo, design to deploy · 193 commits · Dec 2025 to Mar 2026",
    problem:
      "Students juggle coursework, calendars and habits across separate tools, and a plain to-do list makes procrastination easy. Intentionality makes the work feel like progress, and plans from the student's real calendar and courses.",
    built: [
      "Quests, XP and levels, achievements, daily habits and streaks, a focus timer, analytics, friends, groups, and leaderboards.",
      "A Postgres schema of 46 tables across 44 migrations, with row-level security on every table.",
      "Kofi, an AI assistant for chat, a daily briefing, and turning a brain dump into structured tasks.",
      "Calendar sync from Google Calendar and Canvas or any ICS feed.",
    ],
    hardPart:
      "Keeping the AI features usable on free-tier model quotas. I wrote a router that gives each feature a primary and a fallback provider, opens a per-provider circuit breaker after three straight failures, enforces per-user daily caps, and turns provider errors into friendly messages, so a rate limit never breaks the app.",
    results: [
      { value: "300+", label: "users" },
      { value: "46", label: "tables, all with row-level security" },
      { value: "2", label: "LLM providers with automatic failover" },
    ],
    decisions: [
      "Two free-tier providers with failover instead of one paid provider, so the app stays free to run and a rate limit never breaks it.",
      "Row-level security on every table, not just checks in API routes, so a bug in one route can't leak another student's data.",
    ],
    arch: {
      nodes: [
        { id: "app", label: "Web app", tech: "Next.js", mine: true },
        { id: "cal", label: "Calendars", tech: "Google, Canvas ICS" },
        { id: "api", label: "API routes", tech: "user-scoped", mine: true },
        { id: "db", label: "Database", tech: "Supabase + RLS", mine: true },
        { id: "router", label: "AI router", tech: "fallback, breaker", mine: true },
        { id: "llm", label: "LLM providers", tech: "Gemini, Groq" },
      ],
      edges: [
        { from: "app", to: "api" },
        { from: "cal", to: "api", label: "sync" },
        { from: "api", to: "db", label: "queries" },
        { from: "api", to: "router", label: "plans" },
        { from: "router", to: "llm", label: "failover" },
      ],
      caption: "Tradeoff: two cheaper providers with failover instead of one paid one, so the app stays free to run.",
    },
  },

  "ember-run": {
    oneLiner: "A browser parkour game where chaining moves builds flow and raises your top speed. Six characters, three chapters, and every sound made in code.",
    scope: "Solo · Aug 2026 · prototype",
    problem:
      "I wanted a platformer where speed is earned through momentum and kept by skill, with six characters whose kits each answer the course differently. Movement had to be generous enough that no character can get stuck, so difficulty comes from gaps and enemies, not impossible geometry.",
    built: [
      "A player controller with coyote time, jump buffering, variable jump height, wall jumps, dash, slide, and a flow meter that adds up to +140 top speed.",
      "Six characters with distinct kits, and three data-driven chapters with enemies, checkpoints, and a boss guarding each gate.",
      "Ghost replays of your best run, recorded at 20 Hz and smoothed to 60 fps.",
      "All music and sound effects synthesized with WebAudio, plus a Python tool that re-centers misaligned sprite sheets.",
    ],
    hardPart:
      "Ghost replays on a physics engine that is not deterministic. Phaser's arcade physics uses a variable timestep, so replaying inputs would drift. I recorded outputs instead (position, animation state, facing) at 20 Hz, smoothed them up to 60 fps, and snapped instead of smoothing across jumps over 250 px so respawns don't streak across the map. The sample stream is the same shape a live co-op mode would send over a socket.",
    results: [
      { value: "6", label: "playable characters" },
      { value: "3", label: "chapters with boss fights" },
      { value: "0", label: "audio files: all sound is synthesized" },
    ],
    decisions: [
      "Ghosts record what happened (position, animation), not the inputs, because the physics engine isn't deterministic.",
      "Characters and levels live in data files, so a new kit or chapter needs no engine changes.",
      "Every sound is synthesized with WebAudio instead of shipping audio files, so the game stays small and fully in code.",
    ],
    arch: {
      nodes: [
        { id: "input", label: "Keyboard", tech: "input buffer" },
        { id: "data", label: "Kits + levels", tech: "data files", mine: true },
        { id: "player", label: "Player controller", tech: "flow meter", mine: true },
        { id: "game", label: "Game scene", tech: "Phaser arcade", mine: true },
        { id: "ghost", label: "Ghost recorder", tech: "20 Hz samples", mine: true },
        { id: "audio", label: "Synth audio", tech: "WebAudio", mine: true },
      ],
      edges: [
        { from: "input", to: "player" },
        { from: "data", to: "game", label: "levels" },
        { from: "player", to: "game", label: "movement" },
        { from: "game", to: "ghost", label: "samples" },
        { from: "game", to: "audio", label: "cues" },
      ],
      caption: "Character sprites are licensed asset packs; the movement, levels, replays, and audio are mine.",
    },
  },

  "yais-platform": {
    oneLiner: "The website and ticketing platform I built for the Yale Africa Innovation Symposium: verified registration, Stripe checkout, one QR pass per attendee, and a check-in desk for staff.",
    scope: "Chief Technology Officer · Sep 2026 to now · in private testing before launch",
    problem:
      "YAIS V needed a new website and its own ticketing: verified registration, paid tickets for the conference and the gala, a pass people can show at the door, and tools the board can run on event day. Payments had to stay correct when a buyer closes the tab mid-checkout or Stripe sends the same notice twice.",
    built: [
      "The new public website: home, an archive of past editions with an Africa map of Innovation Lab cases, and the team page.",
      "Registration with an emailed code, pricing by attendee type with capacity limits, and Stripe Checkout confirmed by a signed webhook.",
      "One reusable signed QR pass per attendee across every purchase, with a PDF download and confirmation emails sent through a database outbox.",
      "Partial refunds: refunding the gala keeps conference access on the same pass.",
      "A staff workspace: a registration desk with attendees and payments, role-based access for Director, Finance, Registration and Check-in with an audit log, and a QR scanner that runs in a phone browser.",
    ],
    hardPart:
      "Making every payment become exactly one ticket. Stripe can deliver the same webhook twice or out of order, and a buyer can close the tab before the redirect. Fulfillment is idempotent in Postgres, so a replayed webhook finds the order it already filled instead of creating a second ticket or email, and a scheduled job recovers purchases whose webhook never arrived. Check-in has the same problem from the other side: a staff phone can lose a response and retry, and the retry must return the original receipt, not a false 'already scanned'. A row lock rechecks admission when the scan commits, and concurrent transactions in the tests prove it.",
    results: [
      { value: "25", label: "merged pull requests, all mine" },
      { value: "26", label: "Postgres tables behind deny-all row-level security" },
      { value: "105", label: "unit tests, plus database race checks" },
      { value: "1", label: "ticket and email per payment, even on replayed webhooks" },
    ],
    decisions: [
      "Deny-all row-level security, with database functions as the only way in, so a missed check in an API route can't expose attendee data.",
      "One pass per person, not per ticket: the QR code stays the same when someone adds the gala or gets a refund, so nobody arrives at the door with the wrong code.",
      "Access comes from an assigned role, never from a job title or an email domain, and payment amounts are visible only to the Finance role.",
    ],
    arch: {
      nodes: [
        { id: "reg", label: "Registration", tech: "Next.js", mine: true },
        { id: "api", label: "API routes", tech: "verified email", mine: true },
        { id: "db", label: "Database", tech: "Supabase Postgres + RLS", mine: true },
        { id: "stripe", label: "Checkout", tech: "Stripe" },
        { id: "fulfill", label: "Fulfillment", tech: "webhook + cron", mine: true },
        { id: "mail", label: "Pass + email", tech: "outbox, Resend", mine: true },
        { id: "staff", label: "Staff workspace", tech: "desk + scanner", mine: true },
      ],
      edges: [
        { from: "reg", to: "api", label: "code" },
        { from: "api", to: "db", label: "reserve" },
        { from: "api", to: "stripe", label: "pay" },
        { from: "stripe", to: "fulfill", label: "signed event" },
        { from: "fulfill", to: "mail", label: "once" },
        { from: "fulfill", to: "db", label: "ticket" },
        { from: "db", to: "staff", label: "scan" },
      ],
      caption: "Invariant: however many times Stripe reports a payment, it becomes exactly one ticket and one email.",
    },
  },

  "drone-swarm": {
    oneLiner: "The simulation test bench for a Yale drone swarm: one or several Crazyflies fly through obstacle worlds while avoidance methods from published papers are measured against each other.",
    scope: "Undergraduate Researcher, O'Hern Lab · sim-to-real · Sep 2026 to now",
    problem:
      "A drone swarm has to work on real hardware, where every crash costs parts and days. Before anything flies, the project needs one place to run any controller or planner in simulation, see exactly what happened, and compare methods on the same tests.",
    built: [
      "A Crazyflie 2.1 Brushless test bench on Crazyflow (JAX + MuJoCo): waypoint and path flight, a controller slot, and a log of every 100 Hz control tick.",
      "Three obstacle-avoidance methods, each traced to its paper: A* on a grid, a potential field, and a simplified EGO-Planner, compared across three obstacle worlds.",
      "Multi-drone flight where drones share timed plans and plan in priority order (after EGO-Swarm), with formation, crossing, circle-swap and area-sweep missions.",
      "Sim Lab, a local web app that shows every test flight as a video beside a top-down map, flies any test again from the browser, and flags results made with older code or settings.",
      "Plug-in slots so other controllers and planners run through the same tests unchanged, and a 9-flight regression check that runs in about 15 seconds.",
    ],
    hardPart:
      "The simulated drone hovered 8.1 cm off its target height, and tuning gains would have hidden the cause instead of fixing it. I traced it to a thrust constant in the firmware controller that over-drives the Brushless motors by 1.61x, then predicted the offset from that constant before measuring it: 8.1 cm predicted and 8.1 cm measured, and 1.45 cm against 1.5 cm on a second drone model. Fixing the cause matters because the same firmware runs on the real drones.",
    results: [
      { value: "3 of 3", label: "obstacle worlds cleared with no contact (A* and EGO)" },
      { value: "0.81 s → 0", label: "time drones overlapped in a 4-drone swap" },
      { value: "8.1 cm", label: "hover error traced to one constant" },
      { value: "15 s", label: "regression check across 9 flights" },
    ],
    media: [
      { video: "/videos/drone/wall-gap-methods.mp4", poster: "/videos/drone/wall-gap-methods.jpg", caption: "One drone, a wall with a gap, four methods. With no avoidance it flies into the wall, and the potential field gets pushed off course and never reaches the goal. A* and EGO fly through the gap." },
      { video: "/videos/drone/circle-swap.mp4", poster: "/videos/drone/circle-swap.jpg", caption: "Four drones swap places through the middle. Sharing plans took them from 0.81 s of overlap to no contact." },
      { video: "/videos/drone/sweep.mp4", poster: "/videos/drone/sweep.jpg", caption: "Four drones sweep a 3 x 2 m floor in parallel lanes." },
      { video: "/videos/drone/squad-pillars.mp4", poster: "/videos/drone/squad-pillars.jpg", caption: "In progress: a squad of four through pillars, re-planning when a path is blocked." },
    ],
    next: "Training swarm policies with reinforcement learning in JAX, then the first flights on real Crazyflies: one drone, then a squad of four.",
    decisions: [
      "Every method is traced to a paper and labeled faithful, simplified or my own, so a result is trusted for exactly what it is.",
      "My avoidance methods are baselines, not the project's planner: the bench exists to measure planners fairly, so any planner plugs into the same slot and faces the same tests.",
      "Sim Lab marks a result out of date when the code or settings behind it change, so a new method is never compared against a stale run.",
    ],
    arch: {
      nodes: [
        { id: "cfg", label: "Missions + worlds", tech: "config.toml", mine: true },
        { id: "plan", label: "Planner slot", tech: "A*, field, EGO", mine: true },
        { id: "ctrl", label: "Controller slot", tech: "firmware Mellinger" },
        { id: "sim", label: "Simulator", tech: "Crazyflow, JAX + MuJoCo" },
        { id: "logs", label: "Flight logs", tech: "100 Hz CSV", mine: true },
        { id: "lab", label: "Sim Lab", tech: "replay + fly again", mine: true },
      ],
      edges: [
        { from: "cfg", to: "plan", label: "goals" },
        { from: "plan", to: "ctrl", label: "trajectory" },
        { from: "ctrl", to: "sim", label: "commands" },
        { from: "sim", to: "logs", label: "every tick" },
        { from: "logs", to: "lab", label: "replay" },
      ],
      caption: "Invariant: every planner and controller goes through the same slots and the same tests, so results compare like for like.",
    },
  },

  ticketdodge: {
    oneLiner: "A map that scores parking-ticket risk street by street from real NYC violation data, for how long you plan to park.",
    scope: "One-day hackathon · I built the map app, the data pipeline, and the risk score · Jul 2026",
    problem:
      "Drivers in Manhattan guess whether a spot is safe and pay $65 to $115 when they guess wrong. NYC publishes every parking violation as open data, but raw records don't answer 'is this street risky right now, for as long as I'll park?'",
    built: [
      "The map app: a full-screen Leaflet map with geolocation, street search or map click, and a parking-duration picker.",
      "A data script that queries NYC's Parking Violations dataset and builds street, weekday and hour profiles, with fines from the city's official schedule.",
      "The risk score: normalized hourly citation intensity, compounded over the planned stay, with a breakdown of what drove it.",
    ],
    hardPart:
      "Turning sparse, bursty citation records into a number a driver can act on without overclaiming. The city's API does the aggregation into weekday and hour profiles per street, and each hour's normalized intensity becomes an exposure rate compounded over the stay as 1 - (1 - p)^hours. The score is labeled a heuristic, not a probability of getting a ticket.",
    results: [
      { value: "Best Use", label: "of Cursor, Ramp Builders Cup" },
      { value: "1 day", label: "from idea to live" },
    ],
    decisions: [
      "The city's API does the aggregation into street, day and hour profiles, so the app never downloads raw violation records.",
      "The score is labeled a heuristic with a breakdown, not presented as a probability, because the data can't support one.",
    ],
    arch: {
      nodes: [
        { id: "nyc", label: "NYC Open Data", tech: "Socrata API" },
        { id: "script", label: "Aggregate script", tech: "street x day x hour", mine: true },
        { id: "geo", label: "Where + how long", tech: "search, geolocation", mine: true },
        { id: "score", label: "Risk model", tech: "score.ts", mine: true },
        { id: "ui", label: "Map UI", tech: "Leaflet", mine: true },
      ],
      edges: [
        { from: "nyc", to: "script", label: "queries" },
        { from: "script", to: "score", label: "profiles" },
        { from: "geo", to: "score" },
        { from: "score", to: "ui", label: "0 to 100" },
      ],
      caption: "The score is labeled a heuristic, not a probability of getting a ticket.",
    },
  },
};
