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
    oneLiner: "Autonomy for Yale's Mars rover. The rover couldn't drive yet, so I built a physics simulator that runs the team's real navigation code on Mars-like terrain, then wrote the route planning and driving it tests.",
    scope: "Autonomy Lead · Yale Mars Rover Team · Sep 2026 to now · tested in simulation",
    problem:
      "In the University Rover Challenge the rover has to cross hilly desert on its own and stop within 1 m of each target, sometimes without precise RTK GPS. Our rover couldn't drive under computer control yet, so none of the autonomy code had ever been tested, and design questions like where the camera goes were guesses.",
    built: [
      "A physics simulator of our rover in MuJoCo: swerve drive and rocker suspension sized from the team's CAD, and simulated GPS, IMU, wheel odometry and a stereo camera with tag detection, all driving the team's real planning, following and localization code.",
      "Sim Lab, a results page with a test grid, top-down maps and synced 3D replays, and a runner that repeats every full-rover test 20 times so a pass means something.",
      "Route planning and following: A* search with rules for steep ground and ditches, a clearance cost that keeps routes off slopes, path smoothing, and a pure pursuit follower.",
      "A camera-guided final approach to the target post, for when GPS alone can't get within 1 m.",
      "In progress: planning from the rover's own camera map instead of a given one, and from a real elevation map of the competition site.",
      "Earlier: the mission coordinator for both autonomy missions (91 tests), diagnostics, localization startup fixes, and the team's dev containers and CI.",
    ],
    hardPart:
      "The rover kept boxing itself in: its map showed walls that weren't there. I traced it to the camera sitting 0.33 m off the ground. From that low it can't see a slope falling away, so ground it never saw was drawn as obstacles, one cell too thick. I made each camera look count as a separate vote, had the rover stop and look before driving onto ground it hadn't seen, and swept 12 camera mounts in simulation. Moving the camera to about 1 m up, tilted 20 degrees down, raised the hard tests from 60 of 80 to 79 of 80, and the mechanical team agreed to make the camera tilt adjustable.",
    results: [
      { value: "36 → 2", label: "failed drives across 162 random routes after keeping routes off steep ground" },
      { value: "60 → 79", label: "of 80 hard tests passed after moving the camera, a change the mechanical team adopted" },
      { value: "4 of 4", label: "routes finished within 1 m with the camera approach, vs 2 of 4 on GPS alone" },
      { value: "40 of 40", label: "runs up a hill from the real competition site, with no map given" },
    ],
    media: [
      { video: "/videos/rover/crater-wall.mp4", poster: "/videos/rover/crater-wall.jpg", caption: "The 3D view of a full mission at 10x speed: the rover plans a route (blue) around a crater wall, drives it (yellow) and stops at the goal (green)." },
      { video: "/videos/rover/own-map.mp4", poster: "/videos/rover/own-map.jpg", caption: "No map given: the rover builds one from its own camera as it goes, so it has to look at the terrain before it trusts it." },
      { img: "/videos/rover/planner-map.jpg", alt: "Top-down map of the yard with steep ground shaded red and the planned and driven routes drawn around a crater", caption: "The planner's view: red is ground too steep or rough to drive, blue is the planned route, yellow the drive. Terrain: Marsyard 2022 from the open-source LeoRover simulator (MIT)." },
    ],
    next: "Drive the real rover under computer control and compare it with the simulator, then run full missions on the competition-site terrain.",
    decisions: [
      "Test the team's real code, not a copy: the simulator drives the same planner, follower and localization nodes the rover will run.",
      "Every full-rover test runs 20 times, because a single pass in simulation can be luck.",
      "Settle hardware questions in simulation early: the camera mount came from a sweep of 12 positions, not a guess.",
    ],
    arch: {
      nodes: [
        { id: "sim", label: "Rover simulator", tech: "MuJoCo + sensors", mine: true },
        { id: "map", label: "Terrain map", tech: "camera votes" },
        { id: "mission", label: "Mission coordinator", tech: "ROS 2, 91 tests", mine: true },
        { id: "plan", label: "Route planner", tech: "A*, clearance", mine: true },
        { id: "follow", label: "Path follower", tech: "pure pursuit", mine: true },
        { id: "approach", label: "Final approach", tech: "camera to post", mine: true },
        { id: "chassis", label: "Swerve chassis", tech: "team drivers" },
      ],
      edges: [
        { from: "sim", to: "map", label: "camera" },
        { from: "map", to: "plan", label: "terrain" },
        { from: "mission", to: "plan", label: "goal" },
        { from: "plan", to: "follow", label: "route" },
        { from: "follow", to: "approach", label: "last metres" },
        { from: "approach", to: "chassis", label: "drive" },
      ],
      caption: "The terrain mapper, localization and chassis are teammates' work; the simulator runs all of it together, so every part is tested against the others before the rover drives.",
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
      { value: "6,000+", label: "delegates signed up for YMAU VI" },
      { value: "171", label: "delegations" },
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
    oneLiner: "The website and ticketing platform for the Yale Africa Innovation Symposium. The site went live in early November, and ticket sales opened by themselves at midnight on Nov 15.",
    scope: "Chief Technology Officer · Sep 2026 to now · live at yaleafricainnovation.org",
    problem:
      "YAIS V needed a new website and its own ticketing: verified registration, student and professional pricing, a pass people can show at the door, and tools the board can run on event day. Sales had to open on a fixed date, survive a whole campus signing up at once, and never charge anyone twice or lose a ticket.",
    built: [
      "The new public website on the official domain: home, an archive of past editions with an Africa map of Innovation Lab cases, and the team page. Moving the domain didn't interrupt the organization's email.",
      "Four-step registration: details, an emailed code, the ticket, then Stripe checkout. Student pricing needs a university email, and promo codes and complimentary tickets are managed from a board desk.",
      "One signed QR pass per attendee across every purchase, with a PDF download, confirmation emails, and partial refunds that keep the rest of someone's access.",
      "A staff workspace: a registration desk, role-based access for Director, Finance, Registration and Check-in with an audit log, and a QR scanner that runs in a phone browser.",
      "A timed release: ticket links opened automatically at midnight on Nov 15, with a stop switch and a one-step rollback, so nobody had to deploy at midnight.",
    ],
    hardPart:
      "Launch day looks like an attack. A whole campus registering from one Wi-Fi network looks like a single abuser, so the first rate limit locked groups out after ten sign-ups. The email provider caps how fast receipts can go out, so a rush of 300 purchases would have taken more than 100 runs to confirm. And Stripe can report the same payment twice. I gave attendees their own limits and tested a 375-person burst from one network, moved receipts to bounded parallel workers so 300 clear in 5 runs, and made fulfillment idempotent in Postgres, so a repeated payment notice finds the ticket it already created instead of making a second one.",
    results: [
      { value: "65", label: "merged pull requests" },
      { value: "462", label: "automated tests, plus database race checks" },
      { value: "375", label: "people signing up from one network, tested without lockouts" },
      { value: "100+ → 5", label: "runs to send a 300-receipt rush" },
    ],
    decisions: [
      "Deny-all row-level security, with database functions as the only way in, so a missed check in an API route can't expose attendee data.",
      "One pass per person, not per ticket: the QR code stays the same when someone adds a ticket or gets a refund, so nobody arrives at the door with the wrong code.",
      "Sales opened on a timer with a stop switch instead of a midnight deploy, so launch was a setting that could be turned back, not a release that had to go right.",
    ],
    arch: {
      nodes: [
        { id: "reg", label: "Registration", tech: "Next.js", mine: true },
        { id: "api", label: "API routes", tech: "limits, verified email", mine: true },
        { id: "db", label: "Database", tech: "Postgres + RLS", mine: true },
        { id: "stripe", label: "Checkout", tech: "Stripe" },
        { id: "fulfill", label: "Fulfillment", tech: "webhook + cron", mine: true },
        { id: "mail", label: "Pass + email", tech: "bounded workers", mine: true },
        { id: "staff", label: "Staff desk", tech: "roles + scanner", mine: true },
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
    oneLiner: "Simulation and reinforcement learning for a Yale drone swarm. I made the simulator fast enough to train in, got four drones through obstacles without colliding, and caught a learning drone gaming its test before it became a result.",
    scope: "Undergraduate Researcher, O'Hern Lab · Sep 2026 to now · simulation so far",
    problem:
      "The lab wants a swarm of small Crazyflie drones to fly through cluttered spaces on their own. Real drones are fragile and slow to test, so the behavior has to be learned and proven in simulation first. That takes a simulator fast enough to train in, a fair way to compare methods, and results that hold up when you look closely.",
    built: [
      "A simulation bench on Crazyflow (JAX + MuJoCo) for the Crazyflie 2.1 Brushless: obstacle worlds, plug-in slots for controllers and planners, and Sim Lab, a local app that replays and re-runs every flight.",
      "Multi-drone flight where drones share their planned paths and re-plan as they go (after EGO-Swarm), and a 220-run benchmark across 11 mission types that compares it with each drone planning alone.",
      "A rewrite of the flight loop as one compiled JAX program that runs thousands of worlds in parallel: 1,600x faster, and within 0.14 micrometres of the original simulator.",
      "Reinforcement learning (PPO) on top of it: a drone that learns to reach a goal through obstacles using only what it senses within 1 m, with no map.",
      "A redesign of the learning task from evidence: random worlds with obstacles everywhere, each checked to have a route, and a sensing model chosen by measuring what each option misses.",
    ],
    hardPart:
      "The first learning runs looked great: up to 92% of test flights reached the goal. Then I watched the replays. The obstacles never reached the edges of the arena, so there was always an empty lane, and the drone had learned to swing around the obstacle field instead of flying through it; 39 to 48 of 64 test flights left the obstacle area. I withdrew the number and rebuilt the task one piece at a time, measuring each choice. Obstacles now fill the whole arena and past its edges, every world is checked to have a route, and training and test worlds never overlap. For sensing I compared options over 11,442 positions: 16 thin rays miss the nearest obstacle 3.3% of the time, 16 slices of the circle never do, and the real drone's 4-laser layout misses it 38% of the time.",
    results: [
      { value: "1,600x", label: "faster simulation, from 50x to 80,000x real time" },
      { value: "50 of 55", label: "multi-drone runs arrived safely with shared plans, vs 10 of 55 planning alone" },
      { value: "0.14 µm", label: "difference from the original simulator after the rewrite" },
      { value: "0%", label: "nearest obstacles missed by the new sensing model, vs 38% for 4 lasers" },
    ],
    media: [
      { video: "/videos/drone/alone-vs-shared.mp4", poster: "/videos/drone/alone-vs-shared.jpg", caption: "Four drones, two ways. Planning alone, they collide (red). Sharing their plans and re-planning, they don't. On the full benchmark this took safe arrivals from 10 of 55 to 50 of 55." },
      { video: "/videos/drone/before-after.mp4", poster: "/videos/drone/before-after.jpg", caption: "The same missions before and after my fixes to shared planning: drones that crawled for 41 to 55 s, and sometimes touched, now finish in 20 s with no contact." },
      { img: "/videos/drone/speed.jpg", alt: "Chart of simulation speed: the Python loop at 50x real time, the compiled JAX loop near 80,000x with 4,096 parallel worlds", caption: "Rewriting the flight loop in JAX: from 50x real time (dashed line) to about 80,000x across 4,096 worlds on 8 CPU cores." },
      { video: "/videos/drone/rl-pilot.mp4", poster: "/videos/drone/rl-pilot.jpg", caption: "The first learning drone in four test worlds it had never seen. Notice the wide arcs: it reached the goal by going around the obstacles, which is the loophole the replays exposed." },
      { img: "/videos/drone/worlds.jpg", alt: "Before: obstacles only in the middle with empty lanes at the edges. Now: obstacles everywhere, in a sparse and a crowded world", caption: "The fix: obstacles everywhere, including past the edges, so there is no empty lane to exploit." },
      { img: "/videos/drone/sensing.jpg", alt: "Two sensing models: 16 thin rays that miss obstacles between them, and 16 slices that report the closest obstacle in each", caption: "Choosing what the drone senses: thin rays miss obstacles that fall between them, while slices always report the closest one." },
    ],
    next: "Train in the redesigned worlds, give the planners the same 1 m sensing so the comparison is fair, then several learning drones at once and the first real Crazyflies.",
    decisions: [
      "A number counts only after I've watched the flights behind it. The 92% looked right in a table and was wrong in the replays.",
      "Training and test worlds come from separate seeds, so a policy is always scored on worlds it has never seen.",
      "Every method is traced to its paper and labeled faithful, simplified or my own, so a result is trusted for exactly what it is.",
    ],
    arch: {
      nodes: [
        { id: "worlds", label: "World generator", tech: "solvable random worlds", mine: true },
        { id: "sense", label: "Sensing", tech: "16 slices, 1 m", mine: true },
        { id: "policy", label: "Learning policy", tech: "PPO on JaxDEM", mine: true },
        { id: "ctrl", label: "Flight controller", tech: "Mellinger" },
        { id: "sim", label: "Physics", tech: "Crazyflow" },
        { id: "loop", label: "Compiled loop", tech: "JAX, 4,096 worlds", mine: true },
        { id: "lab", label: "Sim Lab", tech: "replay + benchmark", mine: true },
      ],
      edges: [
        { from: "worlds", to: "sense", label: "obstacles" },
        { from: "sense", to: "policy", label: "what it sees" },
        { from: "policy", to: "ctrl", label: "waypoint" },
        { from: "ctrl", to: "sim", label: "commands" },
        { from: "sim", to: "loop", label: "compiled" },
        { from: "loop", to: "lab", label: "every flight" },
      ],
      caption: "The compiled loop runs sensing, policy, controller and physics as one program, so thousands of worlds train at once.",
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
