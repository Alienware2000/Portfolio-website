import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Asterisk, Bookmark, ChevronDown, ChevronLeft, ChevronRight, Copy, EllipsisVertical, Globe, Hand, History, Info,
  Layers, LayoutPanelLeft, List, Maximize2, MousePointer2, MoveHorizontal, PanelLeft, PanelRight, Pause, Play,
  Repeat, RotateCcw, Ruler, Scan, Settings, SkipBack, SkipForward, Sparkles, Square, TimerOff, Undo2, X, ZoomIn,
} from "lucide-react";
import {
  DT, TIMEOUT, command, createSim, expireDeadline, lateResult, runTo, staleId, teleop, tick,
} from "./rovermission/sim.js";

/*
 * Mars Rover autonomy: the team's Foxglove layout (mission-observation.json) watching the
 * mission coordinator drive a simulated TurtleBot through Nav2. The decisions come from a
 * port of machine.py / node.py / nav2_adapter.py in ./rovermission/sim.js.
 */

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Fixed design canvases (16:10), scaled to the container.
const COVER = { w: 640, h: 400, fox: 640, bar: 22, play: 18, head: 18, fs: 9.5, mono: 8.4, icon: 10, k: [4.3, 2.6] };
const FULL = { w: 1040, h: 650, fox: 750, bar: 30, play: 26, head: 24, fs: 11.5, mono: 9.6, icon: 13, k: [4.6, 2.7] };

const C = {
  bar: "#1e1e25", panel: "#17171c", chip: "#24242b", line: "#2b2b33", text: "#e4e4ea", mute: "#9a9aa6", faint: "#676774",
  accent: "#9480ed", scene: "#121216", unknown: "#7e7e7e", free: "#ededed", occ: "#0b0b0b",
  plan: "#c68cff", trail: "#51aaff", goal: "#70dc92", robot: "#ffb020", ok: "#62d394", err: "#ff7b72", warn: "#e3b341",
};

// Value colours for the State Transitions rows.
const VALUE = {
  '"IDLE"': "#93e39b", '"GO_TO_POINT"': "#f0956a", '"STAY"': "#d9964a", '"RETURN"': "#c55c85",
  IDLE: "#c75b81", QUEUED: "#e0c35a", SUBMITTED: "#8fd98a", ACTIVE: "#55bf77", CANCELLING: "#f0956a",
  CANCELLED: "#d9964a", SUCCEEDED: "#93e39b", FAILED: "#ff7b72", True: "#ee7c52", False: "#5a91dd",
};

const COVER_SCRIPT = () => [{ at: 0.6, run: (s) => command(s, "start") }];
const FULL_SCRIPT = () => [
  { at: 0.6, run: (s) => command(s, "start") },
  { at: 2.9, run: (s) => command(s, "stop") },
  { at: 4.2, run: (s) => command(s, "start") },
  { at: 5.4, run: (s) => lateResult(s) },
  { at: 6.9, run: (s) => teleop(s, true) },
  { at: 8.2, run: (s) => command(s, "start") },
  { at: 9.4, run: (s) => teleop(s, false) },
  { at: 10.4, run: (s) => command(s, "start") },
];
// Loop length, first frame and reduced-motion frame for each mode (seconds of demo time).
const TIMING = { cover: { loop: 11, first: 3.6, still: 6.2, span: 6 }, full: { loop: 18, first: 2.2, still: 14, span: 8 } };

const boot = (full, at) => runTo(createSim(full ? FULL_SCRIPT() : COVER_SCRIPT()), at);

/* ---------- map geometry (TurtleBot3 world, 0.05 m cells) ---------- */

function stepped(y0, y1, span, res = 0.05) {
  const right = [];
  const left = [];
  for (let y = y0; y < y1 - 1e-9; y += res) {
    const [l, r] = span(y + res / 2).map((v) => Math.round(v / res) * res);
    right.push([r, y], [r, y + res]);
    left.push([l, y], [l, y + res]);
  }
  const pts = [...right, ...left.reverse()];
  return `M${pts.map((p) => `${p[0].toFixed(3)} ${p[1].toFixed(3)}`).join("L")}Z`;
}
const HEX = stepped(-2.4, 2.4, (y) => {
  const hw = 2.45 - Math.abs(y) / 2.4;
  return [-hw, hw];
});
const PILLARS = [-1.1, 0, 1.1].flatMap((cx) => [-1.1, 0, 1.1].map((cy) =>
  stepped(cy - 0.17, cy + 0.17, (y) => {
    const hw = Math.sqrt(Math.max(0, 0.17 * 0.17 - (y - cy) ** 2));
    return [cx - hw, cx + hw];
  })));

function arrowPts(x, y, yaw, L = 0.32) {
  const rot = ([u, v]) => [x + u * Math.cos(yaw) - v * Math.sin(yaw), y + u * Math.sin(yaw) + v * Math.cos(yaw)];
  const fmt = (pts) => pts.map(rot).map((p) => p.map((v) => v.toFixed(3)).join(",")).join(" ");
  const hl = 0.11;
  return {
    shaft: fmt([[0, -0.034], [L - hl, -0.034], [L - hl, 0.034], [0, 0.034]]),
    head: fmt([[L - hl, -0.085], [L, 0], [L - hl, 0.085]]),
  };
}

function Arrow({ x, y, yaw, color }) {
  const a = arrowPts(x, y, yaw);
  return (
    <g stroke="#00000066" strokeWidth="0.01">
      <polygon points={a.shaft} fill={color} />
      <polygon points={a.head} fill={color} style={{ filter: "brightness(1.15)" }} />
    </g>
  );
}

/* ---------- Foxglove chrome ---------- */

function Panel({ title, rect, D, tools, children, highlight }) {
  const s = D.icon;
  return (
    <div className="absolute flex flex-col overflow-hidden" style={{ left: rect[0], top: rect[1], width: rect[2], height: rect[3], background: C.panel, boxShadow: highlight ? `inset 0 0 0 1px ${C.accent}` : undefined }}>
      <div className="flex shrink-0 items-center gap-[0.55em] px-[0.7em]" style={{ height: D.head, fontSize: D.fs, color: C.text }}>
        <span className="min-w-0 flex-1 truncate">{title}</span>
        {tools}
        <Maximize2 size={s} color={C.mute} />
        <Settings size={s} color={C.mute} />
        <EllipsisVertical size={s} color={C.mute} />
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

function AppBar({ D }) {
  const s = D.icon + 1;
  return (
    <div className="flex items-center gap-[0.7em] px-[0.6em]" style={{ height: D.bar, background: C.bar, borderBottom: `1px solid ${C.line}`, fontSize: D.fs, color: C.text }}>
      <span className="flex items-center justify-center rounded-[4px]" style={{ width: D.bar - 8, height: D.bar - 8, background: "#7b4bf0" }}>
        <Asterisk size={s} color="#fff" strokeWidth={2.6} />
      </span>
      <ChevronDown size={D.icon - 2} color={C.mute} />
      <Layers size={s} color={C.mute} />
      <span className="font-semibold">Yale Robotics (Mars Rover)</span>
      <span className="flex flex-1 items-center justify-center gap-[0.4em] font-mono" style={{ fontSize: D.mono + 0.6 }}>
        <span className="rounded-full" style={{ width: 6, height: 6, background: C.ok }} />
        ws://localhost:8765
        <ChevronDown size={D.icon - 2} color={C.mute} />
      </span>
      <LayoutPanelLeft size={s} color={C.mute} />
      <span>mission-observation</span>
      <ChevronDown size={D.icon - 2} color={C.mute} />
      <PanelLeft size={s} color={C.mute} />
      <PanelRight size={s} color={C.mute} />
      <Globe size={s} color={C.mute} />
      <span className="font-semibold">EDT</span>
      <Sparkles size={s} color={C.accent} />
      <span className="flex items-center justify-center rounded-[4px] font-semibold text-white" style={{ width: D.bar - 8, height: D.bar - 8, background: "#d9457f", fontSize: D.fs - 1 }}>D</span>
    </div>
  );
}

function PlaybackBar({ sim, D, paused }) {
  const s = D.icon;
  return (
    <div className="relative flex items-center gap-[0.8em] px-[0.8em]" style={{ height: D.play, background: C.bar, borderTop: `1px solid ${C.line}`, color: C.mute }}>
      <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: "#3a3a46" }}>
        <div className="h-full w-full" style={{ background: "#5a5a6a" }} />
      </div>
      <Bookmark size={s} />
      <Info size={s} />
      <MoveHorizontal size={s} />
      <span className="font-mono" style={{ fontSize: D.mono + 0.4, color: C.text }}>{(41.2 + sim.t).toFixed(9)}</span>
      <span className="flex flex-1 items-center justify-center gap-[1em]">
        <SkipBack size={s} />
        {paused ? <Play size={s} color={C.text} /> : <Pause size={s} color={C.text} />}
        <SkipForward size={s} />
      </span>
      <Repeat size={s} />
      <span style={{ fontSize: D.fs - 1 }}>1×</span>
    </div>
  );
}

/* ---------- panels ---------- */

function ScenePanel({ sim, w, h, D, full }) {
  const k = Math.min(w / D.k[0], h / D.k[1]);
  const cam = { x: -0.3, y: -0.4 };
  // Camera thetaOffset -180 (as saved in the layout): world +x points left on screen.
  const tx = w / 2 + cam.x * k;
  const ty = h / 2 - cam.y * k;
  const toScreen = (x, y) => [tx - k * x, ty + k * y];
  const r = sim.robot;
  const [rx, ry] = toScreen(r.x, r.y);
  const line = (pts) => pts.map((p) => p.map((v) => v.toFixed(3)).join(",")).join(" ");
  const label = [`${sim.m.state} | control request: ${sim.m.paused ? "HUMAN" : "AUTONOMOUS"}`, `Navigation: ${sim.nav.status}`];
  const lf = full ? 10 : 8.2;
  // Keep the billboard inside the viewport, clear of the toolbar on the right.
  const labelW = Math.max(...label.map((l) => l.length)) * lf * 0.6 + lf * 0.7;
  const labelX = Math.min(Math.max(rx - labelW / 2, 6), w - labelW - D.head - 14);
  return (
    <>
      <svg width={w} height={h} className="absolute inset-0" aria-hidden="true">
        <rect width={w} height={h} fill={C.scene} />
        <g transform={`translate(${tx} ${ty}) scale(${-k} ${k})`}>
          <rect x="-10" y="-10" width="20" height="20" fill={C.unknown} />
          <path d={HEX} fill={C.free} stroke={C.occ} strokeWidth="0.07" shapeRendering="crispEdges" />
          {PILLARS.map((d) => <path key={d} d={d} fill={C.unknown} stroke={C.occ} strokeWidth="0.06" shapeRendering="crispEdges" />)}
          {sim.plan.length > 1 && <polyline points={line(sim.plan)} fill="none" stroke={C.plan} strokeWidth="0.025" />}
          <polyline points={line([...sim.trail, [r.x, r.y]])} fill="none" stroke={C.trail} strokeWidth="0.025" />
          {sim.goal && <Arrow x={sim.goal.x} y={sim.goal.y} yaw={sim.goal.yaw} color={C.goal} />}
          <Arrow x={r.x} y={r.y} yaw={r.yaw} color={C.robot} />
          {/* base_link axes from /tf */}
          <line x1={r.x} y1={r.y} x2={r.x + 0.12 * Math.cos(r.yaw)} y2={r.y + 0.12 * Math.sin(r.yaw)} stroke="#ff4d4d" strokeWidth="0.012" />
          <line x1={r.x} y1={r.y} x2={r.x - 0.12 * Math.sin(r.yaw)} y2={r.y + 0.12 * Math.cos(r.yaw)} stroke="#4dff6a" strokeWidth="0.012" />
        </g>
      </svg>
      {/* /autonomy/mission_demo/mission_label: frame-locked text over base_link */}
      <div className="pointer-events-none absolute whitespace-pre font-mono leading-[1.25] text-white" style={{ left: labelX, top: ry, transform: "translateY(calc(-100% - 0.9em))", fontSize: lf, background: "#000", padding: "0.15em 0.35em" }}>
        {label.join("\n")}
      </div>
      <div className="absolute flex flex-col gap-[0.4em]" style={{ right: 8, top: 8 }}>
        {[[MousePointer2], ["3D", Ruler], [Scan]].map((group, i) => (
          <div key={i} className="flex flex-col items-center gap-[0.45em] rounded-[4px] py-[0.4em]" style={{ width: D.head + 2, background: "#25252d", border: `1px solid ${C.line}`, fontSize: D.fs - 2.5, color: C.text }}>
            {group.map((Item) => (typeof Item === "string"
              ? <span key={Item} className="font-semibold">{Item}</span>
              : <Item key="i" size={D.icon} color={C.text} />))}
          </div>
        ))}
      </div>
      <div className="absolute left-[0.6em] font-mono uppercase tracking-[0.08em]" style={{ bottom: 6, fontSize: full ? 9 : 7.4, color: "#f4f4f6", background: "#000000b3", padding: "0.2em 0.5em" }}>
        Simulation · Gazebo + Nav2 · TurtleBot3 stand-in
      </div>
    </>
  );
}

function DiagnosticsPanel({ sim, D }) {
  const rows = [
    ["mission_runner", sim.m.lastDecision],
    ["nav2_adapter", sim.nav.detail],
  ];
  return (
    <div className="flex h-full flex-col gap-[0.6em] px-[0.6em] pt-[0.3em]" style={{ fontSize: D.fs - 0.5 }}>
      <div className="flex gap-[0.5em]">
        <span className="flex items-center gap-[1.2em] rounded-[3px] px-[0.6em] py-[0.25em]" style={{ background: C.chip, color: C.ok, border: `1px solid ${C.line}` }}>
          OK <ChevronDown size={D.icon - 2} color={C.mute} />
        </span>
        <span className="flex-1 rounded-[3px] px-[0.6em] py-[0.25em]" style={{ background: C.chip, color: C.faint, border: `1px solid ${C.line}` }}>Filter</span>
      </div>
      {rows.map(([name, msg]) => (
        <p key={name} className="pl-[1.4em] leading-[1.35]" style={{ color: C.text }}>
          simulation: {name} <span style={{ color: C.ok }}>{msg}</span>
        </p>
      ))}
    </div>
  );
}

// Live data: the x axis grows from the first message to now, like Foxglove on a live connection.
function windowOf(sim, span) {
  return [0, Math.max(span, sim.t)];
}

function Axis({ t0, t1, x, y, w, D, step }) {
  const ticks = [];
  for (let s = Math.ceil(t0 / step) * step; s <= t1 + 1e-9; s += step) ticks.push(s);
  return ticks.map((s) => (
    <text key={s} x={x(s)} y={y} fill={C.mute} fontSize={D.mono - 0.6} textAnchor={x(s) > w - 14 ? "end" : "middle"} fontFamily="JetBrains Mono, monospace">
      {Number.isInteger(s) ? s : s.toFixed(1)}
    </text>
  ));
}

const stepFor = (t1) => (t1 > 24 ? 4 : t1 > 10 ? 2 : 1);

function TransitionsPanel({ sim, w, h, D, span }) {
  const [t0, t1] = windowOf(sim, span);
  const pad = 8;
  const x = (t) => pad + ((t - t0) / (t1 - t0)) * (w - pad * 2);
  const axisH = D.mono + 6;
  const rowH = (h - axisH) / 3;
  const rows = [
    ["Mission state", sim.series.state],
    ["Human requested (true)", sim.series.teleop],
    ["Nav2 status", sim.series.nav],
  ];
  const cw = (D.mono - 0.4) * 0.6;
  const cf = D.fs > 10 ? D.fs - 0.5 : D.fs - 2; // series chip font
  const step = stepFor(t1);
  const grid = [];
  for (let g = 0; g <= t1; g += step) grid.push(g);
  return (
    <svg width={w} height={h} className="absolute inset-0" aria-hidden="true">
      {grid.map((g) => <line key={g} x1={x(g)} x2={x(g)} y1="0" y2={h - axisH} stroke="#212128" />)}
      {rows.map(([label, series], i) => {
        const top = i * rowH;
        const barY = top + rowH - (D.fs > 10 ? 10 : 7);
        const segs = series.map(([t, v], j) => [t, j + 1 < series.length ? series[j + 1][0] : sim.t, v]);
        // Value labels sit at each change, skipped where they would collide (as Foxglove does).
        let free = -1;
        return (
          <g key={label}>
            {segs.map(([a, b, v]) => {
              const x0 = x(a);
              const x1 = Math.max(x(b), x0 + 1.5);
              const show = x0 >= free && x0 + v.length * cw < w;
              if (show) free = x0 + v.length * cw + 6;
              return (
                <g key={`${a}${v}`}>
                  <rect x={x0} y={barY} width={Math.max(1, x1 - x0 - 1)} height={7} fill={VALUE[v] ?? C.mute} />
                  {show && <text x={x0 + 1} y={barY - (D.fs > 10 ? 3 : 2)} fill={VALUE[v] ?? C.mute} fontSize={D.mono - 0.4} fontFamily="JetBrains Mono, monospace">{v}</text>}
                </g>
              );
            })}
            <rect x="5" y={top + 3} width={label.length * cf * 0.58 + cf * 2.6} height={cf + 6} rx="2" fill={C.chip} stroke={C.line} />
            <text x={5 + cf * 0.6} y={top + 3 + cf + 1.5} fill={C.text} fontSize={cf} fontWeight="600" fontFamily="Inter, system-ui, sans-serif">{label}</text>
            <text x={label.length * cf * 0.58 + cf * 2.1} y={top + 3 + cf + 1.5} fill={C.mute} fontSize={cf} textAnchor="end">×</text>
          </g>
        );
      })}
      <Axis t0={t0} t1={t1} x={x} y={h - 4} w={w} D={D} step={step} />
    </svg>
  );
}

function MotionPanel({ sim, w, h, D, span, full }) {
  const [t0, t1] = windowOf(sim, span);
  const left = D.mono * 3;
  const axisH = D.mono + 5;
  const x = (t) => left + ((t - t0) / (t1 - t0)) * (w - left - 8);
  const [lo, hi] = [-0.2, 0.4];
  const y = (v) => 4 + ((hi - v) / (hi - lo)) * (h - axisH - 8);
  const pts = (i) => sim.speed.filter((p) => p[0] >= t0).map((p) => `${x(p[0]).toFixed(1)},${y(p[i]).toFixed(1)}`).join(" ");
  return (
    <>
      <svg width={w} height={h} className="absolute inset-0" aria-hidden="true">
        {[hi, 0, lo].map((v) => (
          <g key={v}>
            <line x1={left} x2={w - 8} y1={y(v)} y2={y(v)} stroke="#25252d" />
            <text x={left - 4} y={y(v) + 3} fill={C.mute} fontSize={D.mono - 0.6} textAnchor="end" fontFamily="JetBrains Mono, monospace">{v}</text>
          </g>
        ))}
        <polyline points={pts(2)} fill="none" stroke="#f5774d" strokeWidth="1.4" />
        <polyline points={pts(1)} fill="none" stroke="#4e98e2" strokeWidth="1.4" />
        <Axis t0={t0} t1={t1} x={x} y={h - 3} w={w} D={D} step={stepFor(t1)} />
      </svg>
      <div className="absolute flex flex-col gap-[0.2em] rounded-[3px] px-[0.6em] py-[0.3em]" style={{ left: left + 8, top: 3, fontSize: D.fs - (full ? 1.5 : 1.8), background: "#1f1f26ee", border: `1px solid ${C.line}`, color: C.text }}>
        {[["#4e98e2", "Forward speed (m/s)"], ["#f5774d", "Turning speed (rad/s)"]].map(([c, l]) => (
          <span key={l} className="flex items-center gap-[0.5em]"><span style={{ width: "0.7em", height: "0.7em", background: c }} />{l}</span>
        ))}
      </div>
    </>
  );
}

const LEVEL = { INFO: [" INFO", "#d4d4da"], WARN: [" WARN", C.warn], ERROR: ["ERROR", C.err] };
const TERM = "autonomy.mission_demo";

function LogPanel({ sim, D }) {
  const hits = sim.logs.filter((l) => l.name.includes(TERM)).length;
  return (
    <div className="flex h-full flex-col">
      <div className="mx-[0.5em] mb-[0.4em] flex items-center gap-[0.5em] rounded-[3px] px-[0.4em] py-[0.25em]" style={{ background: C.chip, border: `1px solid ${C.line}`, fontSize: D.fs - 1, color: C.faint }}>
        <span className="flex items-center gap-[0.3em] rounded-full px-[0.6em]" style={{ background: "#33333d", color: C.text }}>{TERM} <X size={D.icon - 3} /></span>
        <span className="min-w-0 flex-1 truncate">Search messages</span>
        <span style={{ color: C.text }}>{hits ? 1 : 0} / {hits}</span>
        <ChevronLeft size={D.icon - 1} />
        <ChevronRight size={D.icon - 1} />
        <Copy size={D.icon - 2} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-[0.6em] pb-[0.3em] font-mono leading-[1.38]" style={{ fontSize: D.mono }}>
        {sim.logs.slice(-26).map((l) => {
          const [lv, color] = LEVEL[l.level];
          const i = l.name.indexOf(TERM);
          return (
            <p key={l.id} className="break-words" style={{ color }}>
              [{lv}][{l.stamp}][
              {i < 0 ? l.name : (
                <>
                  <span className="rounded-[2px] px-[0.1em]" style={{ background: "#2d4f7a", outline: "1px solid #4a8fd8", color: "#e8f1ff" }}>{TERM}</span>
                  {l.name.slice(TERM.length)}
                </>
              )}
              ]: {l.msg}
            </p>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- the visitor's side: inputs + the real transition rules ---------- */

const MAIN_STATES = ["IDLE", "GO_TO_POINT", "STAY", "RETURN"];
const OTHER_STATES = ["FOLLOW", "COME", "FETCH_DRIVE", "FETCH_GRASP", "GIVE", "ROUTE_GO", "RETRACE"];
const RULES = [
  { k: ["IDLE|start", "STAY|start"], from: "IDLE / STAY", ev: "start", to: "GO_TO_POINT" },
  { k: ["GO_TO_POINT|arrived"], from: "GO_TO_POINT", ev: "arrived, this ID", to: "IDLE" },
  { k: ["stop"], from: "any", ev: "stop", to: "STAY" },
  { k: ["abort"], from: "any", ev: "abort", to: "RETURN" },
  { k: ["failed", "timeout"], from: "any", ev: "failed, timeout", to: "STAY" },
  { k: ["teleop_on"], from: "any", ev: "teleop_on", to: "IDLE, paused" },
  { k: ["teleop_off"], from: "paused", ev: "teleop_off", to: "IDLE" },
  { k: ["stale"], from: "any", ev: "result, old ID", to: "ignored" },
  { k: ["paused"], from: "paused", ev: "any command", to: "ignored" },
  { k: ["none"], from: "other", ev: "no table entry", to: "ignored" },
];
const LED = { RED: "#ff5a5a", BLUE: "#4e98e2", FLASHING_GREEN: "#62d394" };

function Rail({ sim, live, act, replay, still }) {
  const m = sim.m;
  const old = staleId(sim);
  const left = m.pending ? Math.max(0, TIMEOUT - (sim.t - m.startedAt)) : null;
  const inputs = [
    { label: "Start", icon: Play, run: (s) => command(s, "start"), topic: "command" },
    { label: "Stop", icon: Square, run: (s) => command(s, "stop"), topic: "command" },
    { label: "Abort", icon: Undo2, run: (s) => command(s, "abort"), topic: "command" },
    { label: "Expire deadline", icon: TimerOff, run: expireDeadline, off: !m.pending, topic: "node.py timer" },
    { label: sim.teleop ? "Hand back" : "Take over", icon: Hand, run: (s) => teleop(s, !s.teleop), topic: "teleop", on: sim.teleop },
    { label: "Late result", icon: History, run: lateResult, off: !old, topic: old ? `old ID ...${old.slice(-2)}` : "no old ID yet" },
  ];
  return (
    <aside className="absolute top-0 flex h-full flex-col overflow-hidden font-sans" style={{ left: FULL.fox + 1, width: FULL.w - FULL.fox - 1, background: "#0f0f13", color: C.text, fontSize: 11 }}>
      <div className="flex items-center gap-2 px-3" style={{ height: FULL.bar, borderBottom: `1px solid ${C.line}`, background: "#141419" }}>
        <span className="whitespace-nowrap font-semibold">Mission inputs</span>
        <span className="truncate font-mono text-[9px]" style={{ color: C.faint }}>/autonomy/mission_demo</span>
        <button type="button" onClick={replay} className="ml-auto flex shrink-0 items-center gap-1 rounded-[3px] px-1.5 py-0.5 text-[10px] hover:text-white" style={{ color: C.mute, border: `1px solid ${C.line}` }}>
          <RotateCcw size={10} /> Replay
        </button>
      </div>

      <div className="px-3 pt-2.5">
        <p className="mb-2 text-[10px] leading-snug" style={{ color: live ? C.ok : C.mute }}>
          {live ? "You are driving. Each input goes to the simulated runner." : still ? "Static frame. Click an input to run the coordinator." : "Autoplaying a scripted run. Click any input to take over."}
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {inputs.map(({ label, icon, run, off, topic, on }, i) => {
            const Icon = icon;
            return (
              <button
                key={i}
                type="button"
                aria-label={label}
                disabled={off}
                onClick={() => act(run)}
                className="flex items-center gap-2 rounded-[4px] px-2 py-[5px] text-left transition-colors enabled:hover:border-[#9480ed] enabled:hover:bg-[#1d1b2b] disabled:opacity-40"
                style={{ border: `1px solid ${on ? C.accent : C.line}`, background: on ? "#231f38" : "#17171c" }}
              >
                <Icon size={12} color={on ? C.accent : C.text} />
                <span className="min-w-0">
                  <span className="block leading-tight">{label}</span>
                  <span className="block truncate font-mono text-[8.5px] leading-tight" style={{ color: C.faint }}>{topic}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 truncate rounded-[3px] px-2 py-1 font-mono text-[9px]" style={{ background: "#17171c", color: sim.lastInput ? "#c9c9d2" : C.faint }}>
          $ {sim.lastInput ?? "waiting for a command"}
        </p>
      </div>

      <div className="mt-2.5 px-3">
        <p className="mb-1.5 text-[9.5px] uppercase tracking-[0.12em]" style={{ color: C.faint }}>machine.py state</p>
        <div className="grid grid-cols-4 gap-1">
          {MAIN_STATES.map((s) => {
            const cur = m.state === s;
            return (
              <span key={s} className="rounded-[3px] py-1 text-center font-mono text-[9px] transition-colors" style={{ border: `1px solid ${cur ? C.accent : C.line}`, background: cur ? "#2a2446" : "transparent", color: cur ? "#fff" : C.mute, boxShadow: cur ? "0 0 10px #9480ed55" : "none" }}>
                {s}
              </span>
            );
          })}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-1.5 font-mono text-[8px]" style={{ color: "#4f4f5a" }}>
          {OTHER_STATES.map((s) => <span key={s}>{s}</span>)}
        </div>
        <p className="mt-0.5 text-[8.5px] leading-snug" style={{ color: C.faint }}>RETURN and the other behaviours have no Nav2 integration yet: the adapter rejects them, so the runner fails into STAY.</p>
      </div>

      <div className="mt-2.5 px-3">
        <p className="mb-1 text-[9.5px] uppercase tracking-[0.12em]" style={{ color: C.faint }}>Rule applied</p>
        <div className="font-mono text-[9px]">
          {RULES.map((r) => {
            const hit = r.k.includes(m.rule);
            return (
              <div key={r.ev} className="grid grid-cols-[64px_1fr_84px] gap-1 rounded-[2px] px-1 py-px" style={{ background: hit ? "#2a2446" : "transparent", color: hit ? "#fff" : C.mute }}>
                <span className="truncate">{r.from}</span>
                <span className="truncate" style={{ color: hit ? "#d9d0ff" : C.faint }}>+ {r.ev}</span>
                <span className="truncate">{r.to === "ignored" ? <span style={{ color: hit ? C.warn : undefined }}>ignored</span> : `→ ${r.to}`}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-[86px_1fr] gap-y-[2px] px-3 font-mono text-[9px]">
        <span style={{ color: C.faint }}>request_id</span>
        <span className="truncate">{m.pending ? `...${m.pending.slice(-8)}` : "(none)"}</span>
        <span style={{ color: C.faint }}>led</span>
        <span className="flex items-center gap-1.5">
          <span className={sim.led === "FLASHING_GREEN" && !still ? "animate-pulse" : ""} style={{ width: 7, height: 7, borderRadius: 9, background: LED[sim.led] }} />
          {sim.led}
        </span>
        <span style={{ color: C.faint }}>control_request</span>
        <span>{m.paused ? "HUMAN" : "AUTONOMOUS"}</span>
        <span style={{ color: C.faint }}>deadline</span>
        <span>{left === null ? "not armed" : `${left.toFixed(1)} s left`}</span>
        <span style={{ color: C.faint }}>completion</span>
        <span className="truncate">{sim.completion ? `${sim.completion.behavior}, ${sim.completion.event}` : "(none)"}</span>
      </div>

      <div className="mt-auto px-3 pb-2 text-[8.5px] leading-snug" style={{ color: C.faint, borderTop: `1px solid ${C.line}`, paddingTop: 6 }}>
        <p>Simulation only: Nav2 drives the upstream TurtleBot3 in Gazebo, a stand-in for the rover.</p>
        <p className="mt-1" style={{ color: C.mute }}>Recorded Nav2 run: moved 1.411 m, goal error 0.136 m, no false arrival after stop or takeover.</p>
      </div>
    </aside>
  );
}

/* ---------- root ---------- */

export default function RoverMission({ mode = "cover", playing = true }) {
  const full = mode === "full";
  const D = full ? FULL : COVER;
  const T = full ? TIMING.full : TIMING.cover;
  const [still] = useState(reduced);
  const box = useRef(null);
  const sim = useRef(null);
  const [scale, setScale] = useState(1);
  const [live, setLive] = useState(false);
  const [, setFrame] = useState(0);
  if (!sim.current) sim.current = boot(full, still ? T.still : T.first);

  useLayoutEffect(() => {
    const el = box.current;
    const fit = () => setScale(Math.min(el.clientWidth / D.w, el.clientHeight / D.h));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [D.w, D.h]);

  // One simulation step per 100 ms; pauses off screen, and stays still under reduced motion
  // until the visitor drives it.
  const running = playing && (!still || live);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      tick(sim.current);
      if (!live && sim.current.t >= T.loop) sim.current = boot(full, 0);
      setFrame((f) => f + 1);
    }, DT * 1000);
    return () => clearInterval(id);
  }, [running, live, full, T.loop]);

  const act = (run) => {
    sim.current.script = [];
    run(sim.current);
    setLive(true);
    setFrame((f) => f + 1);
  };
  const replay = () => {
    sim.current = boot(full, still ? T.still : 0);
    setLive(false);
    setFrame((f) => f + 1);
  };

  const s = sim.current;
  const FW = D.fox;
  const PH = D.h - D.bar - D.play;
  const a = Math.round(FW * 0.65);
  const r1 = Math.round(PH * 0.438);
  const st = Math.round((PH - r1 - 1) * 0.643);
  const rects = {
    scene: [0, 0, a, r1],
    diag: [a + 1, 0, FW - a - 1, r1],
    states: [0, r1 + 1, a, st],
    motion: [0, r1 + st + 2, a, PH - r1 - st - 2],
    log: [a + 1, r1 + 1, FW - a - 1, PH - r1 - 1],
  };
  const body = (rect) => [rect[2], rect[3] - D.head];
  const icon = { size: D.icon, color: C.mute };

  return (
    <div ref={box} className="relative h-full w-full overflow-hidden font-sans" style={{ background: C.scene }}>
      <div className="absolute left-0 top-0 origin-top-left select-none" style={{ width: D.w, height: D.h, transform: `scale(${scale})`, background: C.line }}>
        <div className="absolute left-0 top-0 flex flex-col" style={{ width: FW, height: D.h }}>
          <AppBar D={D} />
          <div className="relative flex-1" style={{ background: C.line }}>
            <Panel title="Robot, destination and paths" rect={rects.scene} D={D}>
              <ScenePanel sim={s} w={body(rects.scene)[0]} h={body(rects.scene)[1]} D={D} full={full} />
            </Panel>
            <Panel title="Current node health / last decision" rect={rects.diag} D={D}>
              <DiagnosticsPanel sim={s} D={D} />
            </Panel>
            <Panel title="Mission / human request / navigation" rect={rects.states} D={D} tools={<><List {...icon} /><ZoomIn {...icon} /><Scan {...icon} /></>}>
              <TransitionsPanel sim={s} w={body(rects.states)[0]} h={body(rects.states)[1]} D={D} span={T.span} />
            </Panel>
            <Panel title="Measured motion (m/s and rad/s)" rect={rects.motion} D={D} tools={<><List {...icon} /><ZoomIn {...icon} /><Scan {...icon} /></>}>
              <MotionPanel sim={s} w={body(rects.motion)[0]} h={body(rects.motion)[1]} D={D} span={T.span} full={full} />
            </Panel>
            <Panel title="Timestamped decisions and errors" rect={rects.log} D={D} highlight>
              <LogPanel sim={s} D={D} />
            </Panel>
          </div>
          <PlaybackBar sim={s} D={D} paused={!running} />
        </div>
        {full && <Rail sim={s} live={live} act={act} replay={replay} still={still} />}
      </div>
    </div>
  );
}
