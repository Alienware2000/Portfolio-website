// Scripted turns for the Cloud Coding Agent replica. Everything here is fake:
// three small example tasks, each played as the real route plays a turn
// (plan -> build -> verify -> evidence), plus the "/fix" and "/verify" turns.

const HOME = "http://localhost:8080";
const URL = "localhost:8080";
// The verifier's goto appends a cache-busting param (mechanical, not prompted),
// so the omnibox shows it during verification.
const fresh = (n) => `localhost:8080/?fresh=17614893${n}`;

const tool = (name, arg, extra = {}) => ({ k: "tool", tool: name, arg, ...extra });
const desk = (app, url, cursor) => ({ chrome: true, url, app, cursor });

/* ---------- Todo app: persistence fails, the fix adds localStorage ---------- */
const t0 = { todos: [], input: "" };
const tA = (input) => ({ todos: [], input });
const oat = { t: "Buy oat milk" };
const landlord = { t: "Call the landlord" };

function todoVerify(n, persisted) {
  const f = fresh(n);
  const after = persisted ? { todos: [{ ...oat, done: true }], input: "" } : t0;
  return [
    { k: "reasoning", cover: false },
    tool("goto", HOME, { desk: desk(t0, f) }),
    tool("screenshot", null, { shot: true, cover: false }),
    tool("click", [588, 230], { desk: desk(t0, f, [588, 230]), cover: false }),
    tool("type", "Buy oat milk", { desk: desk(tA("Buy oat milk"), f, [588, 230]) }),
    tool("press", "Enter", { desk: desk({ todos: [oat], input: "" }, f, [588, 230]), rec: "f1" }),
    tool("type", "Call the landlord", { desk: desk({ todos: [oat], input: "Call the landlord" }, f, [588, 230]), cover: false }),
    tool("press", "Enter", { desk: desk({ todos: [oat, landlord], input: "" }, f, [588, 230]), cover: false }),
    tool("click", [401, 292], { desk: desk({ todos: [{ ...oat, done: true }, landlord], input: "" }, f, [401, 292]), rec: "f2" }),
    tool("click", [879, 340], { desk: desk({ todos: [{ ...oat, done: true }], input: "" }, f, [879, 340]), rec: "f3" }),
    tool("press", "F5", { desk: desk(after, f, [879, 340]), rec: "f4" }),
  ];
}

const todo = {
  id: "todo",
  label: "Todo app",
  app: "todo",
  zoom: 1.5,
  tab: "Todos",
  request: "Build a todo app where I can add todos, check them off, and delete them. Serve it on localhost:8080.",
  checklist: [
    { id: "f1", description: "Adding a todo shows it in the list" },
    { id: "f2", description: "Checking a todo marks it as complete" },
    { id: "f3", description: "Deleting a todo removes it from the list" },
    { id: "f4", description: "Todos are still there after reloading the page" },
  ],
  build: [
    { k: "reasoning", cover: false, text: "Plain HTML and JS is enough here. Check what runtimes the sandbox has, write one index.html, serve it statically, then try the main flow in Chrome." },
    tool("exec", "node --version", { exit: 127, out: "bash: line 1: node: command not found", cover: false }),
    tool("exec", "python3 --version", { exit: 0, out: "Python 3.10.12", cover: false }),
    tool("write_file", "/home/user/todo/index.html"),
    tool("run_background", "python3 -m http.server 8080 --directory /home/user/todo"),
    tool("read_logs", "2187", { cover: false }),
    tool("goto", HOME, { desk: desk(t0, URL) }),
    tool("screenshot", null, { shot: true }),
    tool("type", "Test todo", { desk: desk(tA("Test todo"), URL, [588, 230]), cover: false }),
    tool("press", "Enter", { desk: desk({ todos: [{ t: "Test todo" }], input: "" }, URL, [588, 230]), cover: false }),
    { k: "text", text: "Built a single-page todo app in `/home/user/todo/index.html` and served it with `python3 -m http.server`. I added a test todo and it showed up in the list.\n\nRunning at http://localhost:8080" },
  ],
  fix: [
    { k: "reasoning", cover: false, text: "The verifier pressed F5 and the list came back empty. Todos only live in a JS array, so nothing survives a reload. Save to localStorage on every change and load it on startup." },
    tool("read_file", "/home/user/todo/index.html"),
    tool("write_file", "/home/user/todo/index.html"),
    tool("goto", HOME, { desk: desk(t0, URL) }),
    tool("type", "Test todo", { desk: desk(tA("Test todo"), URL, [588, 230]), cover: false }),
    tool("press", "Enter", { desk: desk({ todos: [{ t: "Test todo" }], input: "" }, URL, [588, 230]), cover: false }),
    tool("press", "F5", { desk: desk({ todos: [{ t: "Test todo" }], input: "" }, URL, [588, 230]), cover: false }),
    tool("click", [879, 292], { desk: desk(t0, URL, [879, 292]), cover: false }),
    tool("screenshot", null, { shot: true, cover: false }),
    { k: "text", text: "Todos now save to `localStorage` on every change and load on startup. My test todo survived a reload, and I deleted it before handing off.\n\nRunning at http://localhost:8080" },
  ],
  results: {
    r1: {
      steps: (n) => todoVerify(n, false),
      text: "3 of 4 items work. Adding, completing, and deleting todos all behave correctly. Persistence fails: after F5 the list came back empty, so todos are only kept in page memory.",
      open: "f4",
      checks: {
        f1: ["pass", "Typed \"Buy oat milk\" and pressed Enter. It appeared as the first row and the input cleared."],
        f2: ["pass", "Clicked the checkbox next to \"Buy oat milk\". The text is struck through and the counter dropped to 1 item left."],
        f3: ["pass", "Clicked the x on \"Call the landlord\". That row disappeared and \"Buy oat milk\" stayed."],
        f4: ["fail", "Pressed F5 with one todo in the list. After the reload the list is empty: \"No todos yet.\""],
      },
    },
    r2: {
      steps: (n) => todoVerify(n, true),
      text: "All 4 items pass. Todos can be added, completed, and deleted, and after F5 the list comes back with the completed state intact.",
      open: "f4",
      checks: {
        f1: ["pass", "Typed \"Buy oat milk\" and pressed Enter. It appeared as the first row and the input cleared."],
        f2: ["pass", "Clicked the checkbox next to \"Buy oat milk\". The text is struck through and the counter dropped to 1 item left."],
        f3: ["pass", "Clicked the x on \"Call the landlord\". That row disappeared and \"Buy oat milk\" stayed."],
        f4: ["pass", "Pressed F5 with one completed todo in the list. After the reload \"Buy oat milk\" is still there, still checked."],
      },
    },
  },
};

/* ---------- Dice roller: history never trims, the fix caps it at 5 ---------- */
const dz = (face, history) => ({ face, history });

function diceVerify(n, rolls, capped) {
  const f = fresh(n);
  const steps = [
    { k: "reasoning", cover: false },
    tool("goto", HOME, { desk: desk(dz(null, []), f) }),
    tool("screenshot", null, { shot: true, cover: false }),
  ];
  const hist = [];
  rolls.forEach((r, i) => {
    hist.unshift(r);
    const shown = capped ? hist.slice(0, 5) : [...hist];
    steps.push(tool("click", [640, 408], {
      desk: desk(dz(r, shown), f, [640, 408]),
      rec: i === 0 ? "f1" : i === 1 ? "f2" : i === rolls.length - 1 ? "f3" : undefined,
    }));
  });
  return steps;
}

const dice = {
  id: "dice",
  label: "Dice roller",
  app: "dice",
  zoom: 1.4,
  tab: "Dice Roller",
  request: "Build a dice roller with a Roll button, a die face that shows the result, and a history of the last 5 rolls.",
  checklist: [
    { id: "f1", description: "Clicking Roll shows a die face from 1 to 6" },
    { id: "f2", description: "Each roll is added to the history" },
    { id: "f3", description: "The history keeps only the last 5 rolls" },
  ],
  build: [
    { k: "reasoning", text: "One static page: an SVG die, a Roll button, and a history row. Serve it and click Roll a couple of times." },
    tool("write_file", "/home/user/dice/index.html"),
    tool("run_background", "python3 -m http.server 8080 --directory /home/user/dice"),
    tool("read_logs", "1904"),
    tool("goto", HOME, { desk: desk(dz(null, []), URL) }),
    tool("click", [640, 408], { desk: desk(dz(5, [5]), URL, [640, 408]) }),
    tool("click", [640, 408], { desk: desk(dz(2, [2, 5]), URL, [640, 408]) }),
    tool("screenshot", null, { shot: true }),
    { k: "text", text: "The dice roller is up: an SVG die face, a Roll button, and a history row under it. Two test rolls showed up in the history.\n\nRunning at http://localhost:8080" },
  ],
  fix: [
    { k: "reasoning", text: "Evidence shows 6 history entries after 6 rolls. The roll handler unshifts but never trims. Cap it at 5." },
    tool("read_file", "/home/user/dice/index.html"),
    tool("write_file", "/home/user/dice/index.html"),
    tool("goto", HOME, { desk: desk(dz(null, []), URL) }),
    tool("screenshot", null, { shot: true }),
    { k: "text", text: "The history was appended without a limit. It now keeps only the 5 most recent rolls (`history.slice(0, 5)` after each roll).\n\nRunning at http://localhost:8080" },
  ],
  results: {
    r1: {
      steps: (n) => diceVerify(n, [4, 2, 6, 1, 5, 3], false),
      text: "2 of 3 items pass. Rolling works and every roll lands in the history, but after 6 rolls the history holds 6 entries instead of capping at 5.",
      open: "f3",
      checks: {
        f1: ["pass", "Clicked Roll once. The die shows four pips and the label reads \"You rolled 4\"."],
        f2: ["pass", "Clicked Roll again. A 2 joined the history to the left of the 4."],
        f3: ["fail", "Clicked Roll 6 times. The history shows 6 entries (3, 5, 1, 6, 2, 4); the oldest roll was never dropped."],
      },
    },
    r2: {
      steps: (n) => diceVerify(n, [6, 3, 1, 1, 4, 2], true),
      text: "All 3 items pass. Each roll shows a valid face, lands in the history, and the history stays at 5 entries.",
      open: "f3",
      checks: {
        f1: ["pass", "Clicked Roll once. The die shows six pips and the label reads \"You rolled 6\"."],
        f2: ["pass", "Clicked Roll again. A 3 joined the history to the left of the 6."],
        f3: ["pass", "Clicked Roll 6 times. The history holds exactly 5 entries (2, 4, 1, 1, 3); the first roll dropped off."],
      },
    },
  },
};

/* ---------- Tip calculator: verified on the first pass ---------- */
const tp = (bill, pct, people) => ({ bill, pct, people });

const tip = {
  id: "tip",
  label: "Tip calculator",
  app: "tip",
  zoom: 1.3,
  tab: "Tip Calculator",
  request: "Build a tip calculator: a bill amount, 15/18/20% tip buttons, and a way to split the total between people.",
  checklist: [
    { id: "f1", description: "Entering a bill and picking a tip % shows the tip amount" },
    { id: "f2", description: "Picking a different tip % updates the total" },
    { id: "f3", description: "Splitting between 3 people shows each person's share" },
  ],
  build: [
    { k: "reasoning", text: "Inputs and three buttons, recompute on every change. Keep the math in cents to avoid float rounding." },
    tool("write_file", "/home/user/tip/index.html"),
    tool("run_background", "python3 -m http.server 8080 --directory /home/user/tip"),
    tool("read_logs", "2311"),
    tool("goto", HOME, { desk: desk(tp("", 15, 1), URL) }),
    tool("type", "50", { desk: desk(tp("50", 15, 1), URL, [640, 260]) }),
    tool("screenshot", null, { shot: true }),
    { k: "text", text: "Built the calculator with the math done in cents. A $50 bill at 15% shows a $7.50 tip.\n\nRunning at http://localhost:8080" },
  ],
  results: {
    r1: {
      steps: (n) => {
        const f = fresh(n);
        return [
          { k: "reasoning", cover: false },
          tool("goto", HOME, { desk: desk(tp("", 15, 1), f) }),
          tool("click", [640, 260], { desk: desk(tp("", 15, 1), f, [640, 260]) }),
          tool("type", "84", { desk: desk(tp("84", 15, 1), f, [640, 260]) }),
          tool("click", [640, 346], { desk: desk(tp("84", 18, 1), f, [640, 346]), rec: "f1" }),
          tool("click", [817, 346], { desk: desk(tp("84", 20, 1), f, [817, 346]), rec: "f2" }),
          tool("click", [878, 432], { desk: desk(tp("84", 20, 2), f, [878, 432]) }),
          tool("click", [878, 432], { desk: desk(tp("84", 20, 3), f, [878, 432]), rec: "f3" }),
        ];
      },
      text: "All 3 items pass. The tip, total, and per-person share were correct for every combination I tried.",
      open: "f3",
      checks: {
        f1: ["pass", "Typed 84 as the bill and clicked 18%. Tip reads $15.12 and Total reads $99.12."],
        f2: ["pass", "Clicked 20%. Tip changed to $16.80 and Total to $100.80."],
        f3: ["pass", "Clicked + twice to set People to 3. Each reads $33.60, which is $100.80 / 3."],
      },
    },
  },
};

export const TASKS = [todo, dice, tip];

/** The turns the autoplay walks: fix and re-verify only when the first pass is not green. */
export const defaultTurns = (task) => (task.results.r2 ? ["main", "fix"] : ["main"]);

/** Expand a list of turns ("main" | "fix" | "retry") into a flat list of beats. */
export function expandTurns(task, turns, cover) {
  const beats = [];
  let result = "r1";
  let n = 12047;
  turns.forEach((turn, ti) => {
    const push = (seg, list) => list.forEach((b) => beats.push({ ...b, seg, ti }));
    if (turn === "main") {
      push("Plan", [
        { k: "draft", text: task.request },
        { k: "user", text: task.request },
        { k: "phase", phase: "planning" },
        { k: "checklist" },
      ]);
      push("Build", [{ k: "phase", phase: "building" }, ...task.build]);
    } else if (turn === "fix") {
      result = "r2";
      push("Fix", [{ k: "user", text: "/fix" }, { k: "phase", phase: "building" }, ...task.fix]);
    } else {
      push("Retry", [{ k: "user", text: "/verify" }]);
    }
    const res = task.results[result];
    const seg = turn === "main" ? "Verify" : turn === "fix" ? "Re-verify" : "Retry";
    n += 3311;
    push(seg, [{ k: "phase", phase: "verifying" }, ...res.steps(n), { k: "text", text: res.text }]);
    push(turn === "main" ? "Evidence" : seg, [{ k: "card", res: result, open: res.open, end: true }]);
  });
  const zoomed = beats.map((b) => zoomBeat(b, task.zoom));
  return cover ? zoomed.filter((b) => b.cover !== false && b.k !== "draft") : zoomed;
}

// Apps render at a browser-zoom-like scale around the viewport's top center
// (x 640, y 100), so base layout coordinates map to screen pixels like this.
const zoomAt = (z, [x, y]) => [Math.round(640 + (x - 640) * z), Math.round(100 + (y - 100) * z)];

function zoomBeat(b, z) {
  let out = b;
  if (b.desk?.cursor) out = { ...out, desk: { ...b.desk, cursor: zoomAt(z, b.desk.cursor) } };
  if (b.tool === "click") out = { ...out, arg: zoomAt(z, b.arg).join(", ") };
  return out;
}

const blankDesk = { chrome: false };

/** Fold beats 0..upto into what the screen shows: messages, desktop, status. */
export function reduceBeats(task, beats, upto) {
  const messages = [];
  let deskState = blankDesk;
  let draft = "";
  let status = "ready";
  let recorded = {};
  const last = () => messages[messages.length - 1];
  const agent = () => {
    if (last()?.role !== "agent") messages.push({ role: "agent", parts: [] });
    return last();
  };
  const upsert = (msg, type, part) => {
    const i = msg.parts.findIndex((p) => p.type === type);
    if (i >= 0) msg.parts[i] = part;
    else msg.parts.push(part);
  };

  for (let i = 0; i <= upto && i < beats.length; i++) {
    const b = beats[i];
    if (b.desk) deskState = b.desk;
    if (b.k === "draft") draft = b.text;
    else if (b.k === "user") {
      draft = "";
      recorded = {};
      messages.push({ role: "user", parts: [{ type: "text", text: b.text }] });
      status = "submitted";
    } else if (b.k === "phase") {
      upsert(agent(), "phase", { type: "phase", phase: b.phase });
      status = "streaming";
    } else if (b.k === "checklist") {
      upsert(agent(), "checklist", { type: "checklist", items: task.checklist.map((c) => ({ ...c, passes: false })) });
    } else if (b.k === "reasoning") {
      agent().parts.push({ type: "reasoning", text: b.text || "Open the app, exercise each checklist item like a user, and record a check the moment each outcome is on screen." });
    } else if (b.k === "text") {
      agent().parts.push({ type: "text", text: b.text });
    } else if (b.k === "tool") {
      // record_check is a tool call the real UI does not render; it only
      // makes the harness capture the screen at that instant.
      if (b.rec) recorded[b.rec] = deskState;
      agent().parts.push({ type: "tool", tool: b.tool, arg: b.arg, exit: b.exit, out: b.out, shot: b.shot ? deskState : undefined });
    } else if (b.k === "card") {
      const res = task.results[b.res];
      const checks = task.checklist.map((c) => ({
        itemId: c.id,
        description: c.description,
        status: res.checks[c.id][0],
        evidence: res.checks[c.id][1],
        shot: recorded[c.id],
      }));
      const msg = agent();
      // Verification is the only thing that flips a box: the checklist is
      // re-emitted with passes earned by recorded evidence, then the card.
      upsert(msg, "checklist", { type: "checklist", items: task.checklist.map((c) => ({ ...c, passes: res.checks[c.id][0] === "pass" })) });
      msg.parts.push({ type: "verification", id: b.ti, report: { appUrl: HOME, checks, verdict: verdictOf(checks) } });
      upsert(msg, "phase", { type: "phase", phase: "done" });
      status = "ready";
    }
  }
  const beat = beats[Math.min(upto, beats.length - 1)];
  const cards = messages.flatMap((m) => m.parts.filter((p) => p.type === "verification"));
  return {
    messages,
    desk: deskState,
    draft,
    status,
    busy: status !== "ready",
    seg: beat?.seg,
    lastVerdict: cards.length ? cards[cards.length - 1].report.verdict : null,
  };
}

/** Same rule as the real harness: all pass -> verified, some -> partial, none -> failed. */
function verdictOf(checks) {
  if (checks.length === 0) return "unable_to_verify";
  const passes = checks.filter((c) => c.status === "pass").length;
  if (passes === checks.length) return "verified";
  if (passes > 0) return "partial";
  return checks.every((c) => c.status === "unable_to_verify") ? "unable_to_verify" : "failed";
}
