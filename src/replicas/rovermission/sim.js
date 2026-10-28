// Engine for the RoverMission replica: a JavaScript port of the team's mission
// coordinator (autonomy_mission machine.py + node.py) and its Nav2 bridge
// (nav2_adapter.py). The decisions and log wording follow the Python source; only
// Gazebo/Nav2 is faked, with a simple TurtleBot pose that drives toward the goal.

export const SESSION = "5d0e8b2a9c3f47e1b6a4f20c7d91e3a8";
export const TIMEOUT = 60; // node.py behavior_timeout default (seconds)
export const DT = 0.1;
// nav2_demo.py: TurtleBot spawn pose and the configured target table.
export const START_POSE = { x: -2.0, y: -0.5, yaw: 0 };
const TARGETS = { provided_gnss: [-0.5, -0.5, 0] };
const EPOCH = 1793030415;
const RUNNER = "autonomy.mission_demo.mission_runner";
const ADAPTER = "autonomy.mission_demo.nav2_adapter";

// machine.py TRANSITIONS, unchanged. The interrupts (stop, abort, takeover) sit outside it.
export const TRANSITIONS = {
  "IDLE|start": "GO_TO_POINT",
  "STAY|start": "GO_TO_POINT",
  "GO_TO_POINT|arrived": "IDLE",
  "IDLE|follow": "FOLLOW",
  "IDLE|stay": "STAY",
  "IDLE|fetch": "FETCH_DRIVE",
  "IDLE|come": "COME",
  "IDLE|give": "GIVE",
  "STAY|follow": "FOLLOW",
  "STAY|stay": "STAY",
  "STAY|fetch": "FETCH_DRIVE",
  "STAY|come": "COME",
  "STAY|give": "GIVE",
  "FOLLOW|astronaut_stopped": "IDLE",
  "FETCH_DRIVE|arrived": "FETCH_GRASP",
  "FETCH_GRASP|grasped": "IDLE",
  "COME|arrived": "IDLE",
  "GIVE|released": "IDLE",
  "RETURN|arrived": "IDLE",
  "IDLE|start_route": "ROUTE_GO",
  "STAY|start_route": "ROUTE_GO",
  "IDLE|next": "ROUTE_GO",
  "STAY|next": "ROUTE_GO",
  "ROUTE_GO|arrived": "IDLE",
  "RETRACE|arrived": "IDLE",
};
const FEEDBACK = new Set(["arrived", "astronaut_stopped", "grasped", "released", "astronaut_lost", "failed", "progress"]);
const BEHAVIOR_TARGETS = {
  GO_TO_POINT: "provided_gnss",
  FOLLOW: "astronaut",
  COME: "astronaut",
  FETCH_DRIVE: "hammer",
  FETCH_GRASP: "hammer",
  GIVE: "ground",
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const f2 = (v) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);

export function createSim(script = []) {
  const sim = {
    t: 0,
    n: 0,
    inTick: 0,
    queue: [],
    script: [...script].sort((a, b) => a.at - b.at),
    m: {
      state: "IDLE",
      mode: "assistance",
      pending: null,
      paused: false,
      astronautKnown: true,
      requestNumber: 0,
      lastDecision: "Waiting for a command",
      rule: null,
      ruleSeq: 0,
      startedAt: 0,
    },
    nav: { status: "IDLE", detail: "Waiting for a configured navigation request", active: null, waiting: null },
    robot: { ...START_POSE, v: 0, w: 0 },
    plan: [],
    goal: null,
    trail: [[START_POSE.x, START_POSE.y]],
    nextTrail: 0.2,
    nextReplan: 0,
    led: "RED",
    completion: null,
    teleop: false,
    issued: [],
    lastInput: null,
    logs: [],
    series: { state: [[0, '"IDLE"']], teleop: [], nav: [[0, "IDLE"]] },
    speed: [[0, 0, 0]],
  };
  log(sim, "INFO", "lifecycle_manager_navigation", "Managed nodes are active");
  log(sim, "INFO", RUNNER, "Ready in IDLE; waiting for a command on /autonomy/mission_demo/command");
  log(sim, "INFO", ADAPTER, "Ready for configured simulation goals; waiting for requests");
  return sim;
}

/* ---------- rosout ---------- */

function log(sim, level, name, msg) {
  sim.n += 1;
  sim.inTick += 1;
  // Wall-clock stamps like the real /rosout, strictly increasing within a tick.
  const ns = Math.round(sim.t * 1e9) + sim.inTick * 412337 + ((sim.n * 7919) % 90000);
  const stamp = `${EPOCH + Math.floor(ns / 1e9)}.${String(ns % 1e9).padStart(9, "0")}`;
  sim.logs.push({ id: sim.n, level, name, msg, stamp });
  if (sim.logs.length > 60) sim.logs.shift();
}

const later = (sim, delay, fn) => sim.queue.push({ at: sim.t + delay, fn });
function record(series, t, value) {
  if (!series.length || series[series.length - 1][1] !== value) series.push([t, value]);
}

/* ---------- machine.py ---------- */

function handle(sim, event, data) {
  const m = sim.m;
  m.lastDecision = `Processed ${event}`;
  if (event === "teleop_on" || event === "teleop_off") {
    m.lastDecision = event === "teleop_on"
      ? "Human takeover requested; cancellation requested"
      : "Autonomy enabled; waiting for a fresh command";
    m.rule = event;
    return handleTeleop(sim, event === "teleop_on");
  }
  if (m.paused) {
    m.lastDecision = `Ignored ${event}: autonomy is paused for human control`;
    m.rule = "paused";
    return [];
  }
  if (event === "stop") {
    m.rule = "stop";
    return stop(sim);
  }
  if (event === "abort") {
    m.rule = "abort";
    return abort(sim);
  }
  if (FEEDBACK.has(event)) {
    // Results must belong to the current action before any state/flag changes.
    if (!m.pending || data.id !== m.pending) {
      m.lastDecision = `Ignored ${event}: result ID is not the current request`;
      m.rule = "stale";
      return [];
    }
    if (event === "failed" || event === "astronaut_lost") {
      m.rule = "failed";
      return stop(sim);
    }
  }
  const key = `${m.state}|${event}`;
  const next = TRANSITIONS[key];
  if (!next) {
    m.lastDecision = `Ignored ${event}: no transition from ${m.state}`;
    m.rule = "none";
    return [];
  }
  m.rule = key;
  if (FEEDBACK.has(event)) return completeBehavior(sim, event, next);
  if (event === "start") {
    m.mode = "assistance";
    m.astronautKnown = true;
  }
  return enterState(sim, next, goalFor(next));
}

function enterState(sim, state, goal = {}) {
  const m = sim.m;
  const out = [];
  // Cancellation precedes a replacement request.
  if (m.pending) out.push(["request", { id: m.pending, action: "cancel" }]);
  m.state = state;
  m.pending = null;
  if (state !== "IDLE" && state !== "STAY") {
    m.requestNumber += 1;
    m.pending = `${SESSION}:${m.requestNumber}`;
    out.push(["request", { id: m.pending, action: state, ...goal }]);
  }
  out.push(["state", state]);
  out.push(["led", m.paused ? "BLUE" : "RED"]);
  return out;
}

function handleTeleop(sim, enabled) {
  if (sim.m.paused === enabled) return []; // Repeated mode messages change nothing.
  sim.m.paused = enabled;
  return enterState(sim, "IDLE");
}

const stop = (sim) => enterState(sim, "STAY");

function abort(sim) {
  const m = sim.m;
  if (m.state === "RETURN" || m.state === "RETRACE") return [];
  if (m.mode === "assistance" && m.astronautKnown) return enterState(sim, "RETURN", { target: "astronaut" });
  return enterState(sim, "STAY");
}

const goalFor = (state) => (BEHAVIOR_TARGETS[state] ? { target: BEHAVIOR_TARGETS[state] } : {});

function completeBehavior(sim, event, next) {
  const m = sim.m;
  const completed = m.state;
  const id = m.pending;
  m.pending = null; // so entering the next state does not cancel it
  const out = enterState(sim, next, goalFor(next));
  if (next === "IDLE") {
    out.push(["led", "FLASHING_GREEN"]);
    out.push(["completion", { id, behavior: completed, event, route_done: false }]);
  }
  return out;
}

/* ---------- node.py ---------- */

function dispatch(sim, event, data = {}) {
  const m = sim.m;
  const prev = m.state;
  const prevId = m.pending;
  for (const [topic, payload] of handle(sim, event, data)) publish(sim, topic, payload);
  // A new deadline starts only when the action changes.
  if (prevId !== m.pending) m.startedAt = sim.t;
  m.ruleSeq += 1;
  log(sim, "INFO", RUNNER, `${event}: ${prev} -> ${m.state}; ${m.lastDecision}`);
}

function publish(sim, topic, payload) {
  if (topic === "state") record(sim.series.state, sim.t, `"${payload}"`);
  else if (topic === "led") sim.led = payload;
  else if (topic === "completion") sim.completion = payload;
  else if (topic === "request") {
    if (payload.action !== "cancel") sim.issued.push(payload.id);
    later(sim, 0.05, () => receive(sim, payload));
  }
}

function checkTimeout(sim) {
  const m = sim.m;
  if (m.pending && sim.t - m.startedAt > TIMEOUT) {
    dispatch(sim, "failed", { id: m.pending });
    m.rule = "timeout";
  }
}

/* ---------- nav2_adapter.py ---------- */

function describe(sim, status, detail) {
  sim.nav.status = status;
  sim.nav.detail = detail;
  record(sim.series.nav, sim.t, status);
}

function report(sim, id, event) {
  // Return exactly the mission ID received; never infer completion from distance.
  log(sim, "INFO", ADAPTER, `${id}: ${event}`);
  later(sim, 0.05, () => dispatch(sim, event, { id }));
}

function receive(sim, req) {
  const nav = sim.nav;
  if (req.action === "cancel") {
    if (nav.waiting && nav.waiting.id === req.id) {
      nav.waiting = null;
      if (!nav.active) describe(sim, "CANCELLED", "Queued request removed before it was sent");
    }
    if (nav.active && nav.active.id === req.id) stopActive(sim);
    return;
  }
  if ([nav.active, nav.waiting].some((job) => job && job.id === req.id)) return;
  if (!["GO_TO_POINT", "ROUTE_GO"].includes(req.action) || !(req.target in TARGETS)) {
    describe(sim, nav.status, `Rejected ${req.action}: blocked or target unsupported`);
    report(sim, req.id, "failed");
    return;
  }
  if (nav.waiting) report(sim, nav.waiting.id, "failed");
  const [x, y, yaw] = TARGETS[req.target];
  nav.waiting = { id: req.id, goal: { x, y, yaw }, queuedAt: sim.t };
  if (nav.active) stopActive(sim);
  else describe(sim, "QUEUED", "Waiting for the Nav2 action server");
}

function stopActive(sim) {
  const job = sim.nav.active;
  if (!job.stopping) {
    job.stopping = true;
    job.stopAt = sim.t;
    describe(sim, "CANCELLING", "Stop requested; waiting for a terminal Nav2 result");
  }
}

function replan(sim) {
  const r = sim.robot;
  const g = sim.nav.active.goal;
  const d = Math.hypot(g.x - r.x, g.y - r.y);
  const c = { x: r.x + Math.cos(r.yaw) * d * 0.4, y: r.y + Math.sin(r.yaw) * d * 0.4 };
  sim.plan = Array.from({ length: 17 }, (_, i) => {
    const s = i / 16;
    const a = (1 - s) * (1 - s), b = 2 * s * (1 - s), e = s * s;
    return [a * r.x + b * c.x + e * g.x, a * r.y + b * c.y + e * g.y];
  });
  sim.nextReplan = sim.t + 2;
}

function poll(sim) {
  const nav = sim.nav;
  const job = nav.active;
  const r = sim.robot;
  if (job) {
    if (!job.accepted && sim.t - job.sentAt >= 0.2) {
      job.accepted = true;
      log(sim, "INFO", "bt_navigator", `Begin navigating from current location (${f2(r.x)}, ${f2(r.y)}) to (${f2(job.goal.x)}, ${f2(job.goal.y)})`);
      log(sim, "INFO", "controller_server", "Received a goal, begin computing control effort.");
      replan(sim);
      if (!job.stopping) describe(sim, "ACTIVE", "Nav2 accepted the goal and is navigating");
    }
    if (job.accepted && job.stopping && sim.t - job.stopAt >= 0.3) {
      // Nav2's own cancellation sequence, as it appears in the team's recordings.
      log(sim, "ERROR", "bt_navigator_navigate_to_pose_rclcpp_node", "Failed to get result for follow_path in node halt!");
      log(sim, "INFO", "bt_navigator", "[navigate_to_pose] [ActionServer] Client requested to cancel the goal. Cancelling.");
      log(sim, "INFO", "bt_navigator", "Goal canceled");
      log(sim, "INFO", "controller_server", "Cancellation was successful. Stopping the robot.");
      nav.active = null;
      // A late success after stop is never reported as arrival.
      describe(sim, "CANCELLED", "Nav2 action ended after stop; inspect measured speed");
    } else if (job.accepted && !job.stopping) {
      if (Math.hypot(job.goal.x - r.x, job.goal.y - r.y) < 0.14) {
        log(sim, "INFO", "controller_server", "Reached the goal!");
        log(sim, "INFO", "bt_navigator", "Goal succeeded");
        nav.active = null;
        report(sim, job.id, "arrived");
        describe(sim, "SUCCEEDED", "Nav2 returned a terminal result");
      } else if (sim.t >= sim.nextReplan) {
        replan(sim);
        log(sim, "INFO", "controller_server", "Passing new path to controller.");
      }
    }
  }
  if (nav.active || !nav.waiting || nav.waiting.queuedAt >= sim.t - 1e-6) return;
  nav.active = { ...nav.waiting, sentAt: sim.t, accepted: false, stopping: false };
  nav.waiting = null;
  sim.goal = nav.active.goal;
  describe(sim, "SUBMITTED", "Goal sent; waiting for Nav2 acceptance");
}

/* ---------- fake TurtleBot + mission_observer trail ---------- */

function drive(sim) {
  const r = sim.robot;
  const job = sim.nav.active;
  if (job && job.accepted && !job.stopping) {
    const g = job.goal;
    const err = wrap(Math.atan2(g.y - 0.07 - r.y, g.x - r.x) - r.yaw);
    const d = Math.hypot(g.x - r.x, g.y - r.y);
    const target = Math.min(0.26, 0.5 * d + 0.04) * Math.max(0, Math.cos(err));
    r.v += clamp(target - r.v, -0.08, 0.05);
    r.w = clamp(1.8 * err, -0.9, 0.9) + 0.02 * Math.sin(sim.t * 2.1) + 0.012 * Math.sin(sim.t * 4.7 + 1);
  } else {
    r.v = Math.max(0, r.v - 0.15);
    r.w = Math.abs(r.w) < 0.01 ? 0 : r.w * 0.4;
  }
  r.yaw += r.w * DT;
  r.x += r.v * Math.cos(r.yaw) * DT;
  r.y += r.v * Math.sin(r.yaw) * DT;
  if (sim.t >= sim.nextTrail) {
    sim.nextTrail = sim.t + 0.2;
    const [lx, ly] = sim.trail[sim.trail.length - 1];
    if (Math.hypot(r.x - lx, r.y - ly) > 0.003) sim.trail.push([r.x, r.y]);
  }
  sim.speed.push([sim.t, r.v, r.w]);
  if (sim.speed.length > 420) sim.speed.shift();
}

/* ---------- public API ---------- */

export function tick(sim) {
  sim.t = Math.round((sim.t + DT) * 1000) / 1000;
  sim.inTick = 0;
  while (sim.script.length && sim.script[0].at <= sim.t + 1e-9) sim.script.shift().run(sim);
  const due = sim.queue.filter((q) => q.at <= sim.t + 1e-9);
  sim.queue = sim.queue.filter((q) => q.at > sim.t + 1e-9);
  due.forEach((q) => q.fn());
  checkTimeout(sim);
  poll(sim);
  drive(sim);
}

export function runTo(sim, t) {
  while (sim.t < t - 1e-9) tick(sim);
  return sim;
}

export function command(sim, event) {
  sim.lastInput = `command '{"event":"${event}"}'`;
  dispatch(sim, event);
}

export function teleop(sim, on) {
  sim.lastInput = `ros2 topic pub --once .../teleop std_msgs/msg/Bool "{data: ${on}}"`;
  sim.teleop = on;
  record(sim.series.teleop, sim.t, on ? "True" : "False");
  dispatch(sim, on ? "teleop_on" : "teleop_off");
}

/** The newest request ID that is no longer current: what a delayed result would carry. */
export const staleId = (sim) => [...sim.issued].reverse().find((id) => id !== sim.m.pending) ?? null;

export function lateResult(sim) {
  const id = staleId(sim);
  if (!id) return;
  sim.lastInput = `result '{"event":"arrived","id":"...${id.slice(-6)}"}'`;
  dispatch(sim, "arrived", { id });
}

/** Skip ahead to the moment node.py's 60 s deadline passes with no result. */
export function expireDeadline(sim) {
  if (!sim.m.pending) return;
  sim.lastInput = `# ${TIMEOUT}.0 s pass with no result for ...${sim.m.pending.slice(-6)}`;
  sim.m.startedAt = sim.t - TIMEOUT - DT;
}
