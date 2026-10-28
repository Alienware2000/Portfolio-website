import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  DUMP_COVER, DUMP_FULL, DUMP_NOTES, KOFI_ASK, KOFI_REPLY, PRESETS, START, SUGG_COVER, SUGG_FULL, TASK_XP, TODAY,
  focusXp, levelInfo, proRatedXp,
} from "./intentionality/data.js";
import { Briefing, BrainDump, Focus, Habits, Header, Kofi, LevelUp, STYLE, SectionTitle, Sidebar, Stats, Today, XpToasts } from "./intentionality/parts.jsx";

/*
 * Intentionality (intentionality.io): the logged-in Command Center, rebuilt from the app's own
 * components (Sidebar, DashboardContent, DayTimeline, FocusLauncher/FocusTimer, BrainDumpModal,
 * ChatPanel) on fake data. The UI is laid out at a fixed desktop size and scaled to fit.
 * Autoplay is a pure function of time: frame(t) replays the script from scratch, so pausing,
 * looping and handing control to the visitor are all just "stop advancing t".
 */

const ACCEL = 60; // focus timer runs 60x: a real second is a timer minute
const SIZE = { cover: [1120, 700], full: [1200, 750] };
const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const idleFocus = () => ({ mode: "idle", running: false, remaining: 0, work: 25, brk: 5, title: "", worked: 0 });
const base = () => ({
  ...structuredClone(START), bd: null, kofi: null, kofiOpen: false, focus: idleFocus(), launcher: false, preset: 3,
  fx: [], levelUp: null, pendingLevel: null, press: null, view: "top", viewN: 0, ticked: false,
});

/* ---- game rules, applied to a draft state (same in autoplay and in the visitor's hands) ---- */

function gainXp(s, xp, fxId) {
  if (xp <= 0) return;
  const before = levelInfo(s.xp).level;
  s.xp += xp;
  s.fx.push({ id: fxId, xp });
  if (levelInfo(s.xp).level > before) s.pendingLevel = levelInfo(s.xp).level;
  if (!s.ticked) { s.streak += 1; s.ticked = true; } // first XP of the day extends the streak
}

function toggleTask(s, id, fxId) {
  const t = s.tasks.find((x) => x.id === id);
  t.done = !t.done;
  if (t.done) gainXp(s, TASK_XP, fxId);
  else s.xp -= TASK_XP;
}

function toggleHabit(s, id, fxId) {
  const h = s.habits.find((x) => x.id === id);
  h.done = !h.done;
  h.streak += h.done ? 1 : -1;
  if (h.done) gainXp(s, TASK_XP, fxId);
  else s.xp -= TASK_XP;
}

// Suggestions become real items; only tasks due today show up on the dashboard
function createSugg(s, i) {
  if (s.bd.created[i]) return;
  s.bd.created[i] = true;
  const g = s.bd.sugg[i];
  if (g.type === "task" && g.due === TODAY) s.tasks.push({ id: `n${s.tasks.length}`, title: g.title, priority: g.priority, done: false, fresh: true });
  if (g.type === "habit") s.habits.push({ id: `nh${s.habits.length}`, title: g.title, streak: 0, done: false, fresh: true });
}

function startFocus(s, work, brk, title) {
  s.focus = { mode: "work", running: true, remaining: work * 60, work, brk, title, worked: 0 };
  s.launcher = false;
}

function tickFocus(f, sec) {
  if (!f.running) return;
  f.remaining -= sec;
  if (f.remaining > 0) return;
  if (f.mode === "work") f.worked = f.work * 60;
  if (f.mode === "work" && f.brk > 0) Object.assign(f, { mode: "break", remaining: f.brk * 60 });
  else Object.assign(f, { mode: "completed", running: false, remaining: 0 });
}

function completeFocus(s, fxId) {
  const f = s.focus;
  const worked = f.mode === "work" ? f.work * 60 - f.remaining : f.worked;
  s.focus = idleFocus();
  gainXp(s, proRatedXp(worked / 60, f.work), fxId);
}

const view = (s, name) => { s.view = name; s.viewN += 1; };
const openBd = (s) => { s.bd = { text: "", phase: "edit", sugg: [], created: [], notes: "" }; };
const results = (s, sugg) => Object.assign(s.bd, { phase: "results", sugg: structuredClone(sugg), created: sugg.map(() => false), notes: DUMP_NOTES });
const focusAction = (title) => ({ type: "START_FOCUS", label: `Start 25min focus session${title ? `: ${title}` : ""}`, work: 25, title });

/* ---- local stand-ins for the two AI calls (the real app sends these to an LLM) ---- */

const WEEKDAYS = { wednesday: "2026-10-28", thursday: "2026-10-29", friday: "2026-10-30", saturday: "2026-10-31", sunday: "2026-11-01", monday: "2026-11-02" };

function parseDump(text) {
  const t = text.trim();
  if (t === DUMP_FULL) return { sugg: SUGG_FULL, notes: DUMP_NOTES };
  if (t === DUMP_COVER) return { sugg: SUGG_COVER, notes: DUMP_NOTES };
  const habitWords = /\b(every|daily|nightly|weekly|more|each)\b/;
  const parts = t.split(/[,;\n.]|\band\b/i).map((p) => p.trim()).filter((p) => p.length > 2).slice(0, 6);
  let habitFrom = null;
  const sugg = parts.map((p) => {
    const l = p.toLowerCase();
    const habit = habitWords.test(l);
    if (habit && !habitFrom) habitFrom = p;
    const day = Object.keys(WEEKDAYS).find((d) => l.includes(d));
    const due = /today|tonight/.test(l) ? TODAY : /tomorrow/.test(l) ? "2026-10-28" : day ? WEEKDAYS[day] : /next week/.test(l) ? "2026-11-02" : undefined;
    const priority = /asap|urgent|important/.test(l) ? "high" : /whenever|eventually|low priority/.test(l) ? "low" : "medium";
    const words = /\b(due|by|on|today|tonight|tomorrow|next week|asap|urgent|important|whenever|eventually|low priority|high priority|every (?:day|night|morning|week)|daily|nightly|weekly|more|each|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi;
    const clean = p.replace(words, "").replace(/\s+/g, " ").trim() || p;
    return { type: habit ? "habit" : "task", title: clean[0].toUpperCase() + clean.slice(1, 60), due: habit ? undefined : due || TODAY, priority };
  });
  return { sugg, notes: habitFrom ? `I turned '${habitFrom}' into a habit since it sounds like a recurring goal.` : "" };
}

function kofiReply(q, s) {
  const l = q.toLowerCase();
  const open = s.tasks.filter((t) => !t.done);
  if (/focus|pomodoro|timer/.test(l)) {
    const m = l.match(/(\d+)\s*-?\s*min/);
    const work = Math.min(Math.max(m ? Number(m[1]) : 25, 1), 180);
    return { content: `Let's lock in. A ${work} minute session is worth ${focusXp(work)} XP once you pass the halfway mark.`, actions: [{ ...focusAction(""), work, label: `Start ${work}min focus session` }] };
  }
  if (/create|add|remind|task to/.test(l)) {
    const raw = (l.match(/(?:task to|remind me to|add|create)\s+(.*)/) || [null, "new task"])[1];
    const due = /tomorrow/.test(raw) ? "2026-10-28" : TODAY;
    const title = raw.replace(/\b(tomorrow|today|tonight|a task to)\b/g, "").trim() || "New task";
    const task = { title: title[0].toUpperCase() + title.slice(1), due, priority: "medium" };
    return { content: due === TODAY ? "Sure, I can add that for today." : "Got it. Here's a task for tomorrow so it's waiting when you wake up.", actions: [{ type: "CREATE_TASK", label: `Create task: "${task.title}" (due ${due}) [medium]`, task }] };
  }
  const idle = s.focus.mode === "idle";
  const pset = s.tasks.find((t) => t.id === "t1");
  if (/tonight|work on|should i|plan/.test(l) && pset && !pset.done) return { content: KOFI_REPLY, actions: idle ? [focusAction(pset.title)] : [] };
  if (!open.length) return { content: "You've cleared everything due today. Nice work. Your daily review is still open if you want the extra 20 XP.", actions: [] };
  const list = open.map((t) => `• ${t.title} (${t.priority})`).join("\n");
  const top = open.find((t) => t.priority === "high") || open[0];
  return { content: `Here's what's left today:\n${list}\n\nYour library block from 8 to 10 PM is a good window for "${top.title}".`, actions: idle ? [focusAction(top.title)] : [] };
}

/* ---- scripts: [at, fn] fires once, [at, duration, fn(s, progress, elapsed)] runs continuously ---- */

const typeInto = (text, get) => (s, p) => get(s, text.slice(0, Math.round(text.length * p)));

const COVER = {
  total: 12800,
  still: 6500,
  // Open on the dashboard with the new tasks in place, not behind the brain-dump popup
  start: 7400,
  steps: [
    [600, (s) => { s.press = "bd"; }],
    [900, (s) => { s.press = null; openBd(s); }],
    [1200, 2300, typeInto(DUMP_COVER, (s, v) => { s.bd.text = v; })],
    [3800, (s) => { s.press = "ai"; s.bd.phase = "processing"; }],
    [4050, (s) => { s.press = null; }],
    [4900, (s) => results(s, SUGG_COVER)],
    [5700, (s) => { s.press = "createAll"; }],
    [5900, (s) => { s.press = null; createSugg(s, 0); }],
    [6150, (s) => createSugg(s, 1)],
    [6400, (s) => createSugg(s, 2)],
    [7200, (s) => { s.bd = null; }],
    [7900, (s) => { s.press = "n4"; }],
    [8150, (s) => { s.press = null; toggleTask(s, "n4", "x1"); }],
    [9050, (s) => { s.levelUp = s.pendingLevel; s.pendingLevel = null; }],
    [9800, (s) => { s.fx = []; }],
    [11300, (s) => { s.levelUp = null; }],
  ],
};

const FULL = {
  total: 33500,
  still: 13600,
  steps: [
    [700, (s) => { s.press = "bd"; }],
    [1000, (s) => { s.press = null; openBd(s); }],
    [1300, 2900, typeInto(DUMP_FULL, (s, v) => { s.bd.text = v; })],
    [4500, (s) => { s.press = "ai"; s.bd.phase = "processing"; }],
    [4750, (s) => { s.press = null; }],
    [5700, (s) => results(s, SUGG_FULL)],
    [6600, (s) => { s.press = "createAll"; }],
    [6800, (s) => { s.press = null; createSugg(s, 0); }],
    [7050, (s) => createSugg(s, 1)],
    [7300, (s) => createSugg(s, 2)],
    [7550, (s) => createSugg(s, 3)],
    [8300, (s) => { s.bd = null; }],
    [8700, (s) => view(s, "today")],
    [9800, (s) => { s.press = "n4"; }],
    [10050, (s) => { s.press = null; toggleTask(s, "n4", "x1"); }],
    [10950, (s) => { s.levelUp = s.pendingLevel; s.pendingLevel = null; }],
    [11700, (s) => { s.fx = []; }],
    [12900, (s) => { s.levelUp = null; }],
    [13300, (s) => view(s, "top")],
    [13900, (s) => { s.press = "kofi"; }],
    [14100, (s) => { s.press = null; s.kofiOpen = true; s.kofi = { msgs: [], input: "" }; }],
    [14700, 1200, typeInto(KOFI_ASK, (s, v) => { s.kofi.input = v; })],
    [16100, (s) => { s.press = "send"; }],
    [16300, (s) => {
      s.press = null;
      s.kofi.input = "";
      s.kofi.msgs.push({ id: "u1", role: "user", content: KOFI_ASK }, { id: "a1", role: "assistant", content: "", streaming: true });
    }],
    [17100, 2700, (s, p) => { s.kofi.msgs[1].content = KOFI_REPLY.slice(0, Math.round(KOFI_REPLY.length * p)); }],
    [19800, (s) => Object.assign(s.kofi.msgs[1], { streaming: false, actions: [focusAction("Finish CPSC 223 pset 4")] })],
    [21000, (s) => { s.press = "act0"; }],
    [21300, (s) => { s.press = null; s.kofi.msgs[1].actions[0].done = true; startFocus(s, 25, 5, "Finish CPSC 223 pset 4"); }],
    [21300, 12000, (s, p, dt) => { s.focus.remaining = Math.max(0, 1500 - Math.floor((dt / 1000) * ACCEL * 2)); }],
    [22200, (s) => { s.kofiOpen = false; view(s, "focus"); }],
  ],
};
for (const sc of [COVER, FULL]) sc.steps.sort((a, b) => a[0] - b[0]);

function frame(script, t) {
  const s = base();
  for (const [at, a, b] of script.steps) {
    if (t < at) break;
    if (typeof a === "function") a(s);
    else b(s, Math.min(1, (t - at) / a), Math.min(t - at, a));
  }
  return s;
}

// What the visitor inherits when they grab the controls mid-script
function settle(s) {
  s.press = null;
  if (s.bd?.phase === "edit" && s.bd.text) s.bd.text = DUMP_FULL;
  if (s.bd?.phase === "processing") results(s, SUGG_FULL);
  if (s.kofi?.input) s.kofi.input = KOFI_ASK;
  const m = s.kofi?.msgs[1];
  if (m?.streaming) Object.assign(m, { content: KOFI_REPLY, streaming: false, actions: [focusAction("Finish CPSC 223 pset 4")] });
  return s;
}

export default function Intentionality({ mode = "cover", playing = true }) {
  const full = mode === "full";
  const [W, H] = SIZE[full ? "full" : "cover"];
  const script = full ? FULL : COVER;
  const [reduce] = useState(prefersReduced);
  const [t, setT] = useState(() => (reduce ? script.still : script.start ?? 0));
  const [live, setLive] = useState(null); // null while autoplay owns the screen
  const auto = live === null;
  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const todayRef = useRef(null);
  const focusRef = useRef(null);
  const ids = useRef(0);
  const [scale, setScale] = useState(0);

  const scripted = useMemo(() => frame(script, t), [script, t]);
  const s = auto ? scripted : live;
  const current = useRef(s);
  current.current = s;

  // Fit the fixed-size desktop UI into whatever box the card gives us
  useLayoutEffect(() => {
    const el = rootRef.current;
    const fit = () => setScale(el.clientWidth / W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [W]);

  // Autoplay clock
  useEffect(() => {
    if (!auto || !playing || reduce) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const d = Math.min(now - last, 200);
      last = now;
      setT((x) => (x + d >= script.total ? 0 : x + d));
    }, 50);
    return () => clearInterval(id);
  }, [auto, playing, reduce, script]);

  // Scroll the main column to whatever section the story is about
  useEffect(() => {
    const m = mainRef.current;
    if (!m) return;
    const target = s.view === "today" ? todayRef.current : s.view === "focus" ? focusRef.current : null;
    const to = Math.min(target ? target.offsetTop - 20 : 0, m.scrollHeight - m.clientHeight);
    const from = m.scrollTop;
    if (reduce || Math.abs(to - from) < 2) { m.scrollTop = to; return; }
    // Fixed-length ease so the story's timing doesn't depend on the browser's smooth-scroll speed
    const t0 = performance.now();
    const id = setInterval(() => {
      const p = Math.min((performance.now() - t0) / 550, 1);
      m.scrollTop = from + (to - from) * (1 - Math.pow(1 - p, 3));
      if (p === 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [s.view, s.viewN, reduce]);

  const edit = useCallback((fn) => setLive((p) => {
    if (!p) return p;
    const d = structuredClone(p);
    fn(d);
    return d;
  }), []);
  const nid = () => `l${++ids.current}`;

  const takeOver = () => {
    if (!full || !auto) return;
    setLive(settle(structuredClone(current.current)));
  };
  const replay = () => {
    setLive(null);
    setT(0);
  };

  /* ---- live timers once the visitor is driving (all paused when off screen) ---- */
  const L = live;
  useEffect(() => {
    if (!L?.focus.running || !playing) return;
    const id = setInterval(() => edit((d) => tickFocus(d.focus, ACCEL / 10)), 100);
    return () => clearInterval(id);
  }, [L?.focus.running, playing, edit]);

  const fxHead = L?.fx[0]?.id;
  useEffect(() => {
    if (!fxHead || !playing) return;
    const id = setTimeout(() => edit((d) => { d.fx = d.fx.filter((f) => f.id !== fxHead); }), 1600);
    return () => clearTimeout(id);
  }, [fxHead, playing, edit]);

  useEffect(() => {
    if (!L?.pendingLevel || !playing) return;
    const id = setTimeout(() => edit((d) => { d.levelUp = d.pendingLevel; d.pendingLevel = null; }), 900);
    return () => clearTimeout(id);
  }, [L?.pendingLevel, playing, edit]);

  useEffect(() => {
    if (!L?.levelUp || !playing) return;
    const id = setTimeout(() => edit((d) => { d.levelUp = null; }), 3500);
    return () => clearTimeout(id);
  }, [L?.levelUp, playing, edit]);

  useEffect(() => {
    if (L?.bd?.phase !== "processing" || !playing) return;
    const id = setTimeout(() => edit((d) => {
      if (d.bd?.phase !== "processing") return;
      const r = parseDump(d.bd.text);
      results(d, r.sugg);
      d.bd.notes = r.notes;
    }), 1200);
    return () => clearTimeout(id);
  }, [L?.bd?.phase, playing, edit]);

  const streaming = L?.kofi?.msgs.find((m) => m.streaming)?.id;
  useEffect(() => {
    if (!streaming || !playing) return;
    let iv;
    const step = () => edit((d) => {
      const m = d.kofi.msgs.find((x) => x.id === streaming);
      m.content = m.full.slice(0, m.content.length + 4);
      if (m.content.length >= m.full.length) m.streaming = false;
    });
    const wait = setTimeout(() => { iv = setInterval(step, 30); }, 700);
    return () => { clearTimeout(wait); clearInterval(iv); };
  }, [streaming, playing, edit]);

  const act = {
    toggleTask: (id) => edit((d) => toggleTask(d, id, nid())),
    toggleHabit: (id) => edit((d) => toggleHabit(d, id, nid())),
    focusTask: (task) => edit((d) => { if (d.focus.mode === "idle") { startFocus(d, 25, 5, task.title); view(d, "focus"); } }),
    toggleLauncher: () => edit((d) => { d.launcher = !d.launcher; }),
    setPreset: (i) => edit((d) => { d.preset = i; }),
    startFocus: (w, b, title) => edit((d) => startFocus(d, w, b, title)),
    pauseFocus: () => edit((d) => { d.focus.running = !d.focus.running; }),
    skipFocus: () => edit((d) => {
      const f = d.focus;
      if (f.mode === "work") {
        f.worked = f.work * 60 - f.remaining;
        Object.assign(f, f.brk > 0 ? { mode: "break", remaining: f.brk * 60, running: true } : { mode: "completed", running: false, remaining: 0 });
      } else if (f.mode === "break") Object.assign(f, { mode: "completed", running: false, remaining: 0 });
    }),
    completeFocus: () => edit((d) => completeFocus(d, nid())),
    abandonFocus: () => edit((d) => { d.focus = idleFocus(); }),
    openBd: () => edit((d) => { if (!d.bd) openBd(d); }),
    closeBd: () => edit((d) => { d.bd = null; }),
    editBd: (v) => edit((d) => { d.bd.text = v; }),
    processBd: () => edit((d) => { if (d.bd.text.trim()) d.bd.phase = "processing"; }),
    createOne: (i) => edit((d) => createSugg(d, i)),
    createAll: () => edit((d) => d.bd.sugg.forEach((_, i) => createSugg(d, i))),
    openKofi: () => edit((d) => { d.kofiOpen = true; d.kofi = d.kofi || { msgs: [], input: "" }; }),
    closeKofi: () => edit((d) => { d.kofiOpen = false; }),
    kofiInput: (v) => edit((d) => { d.kofi.input = v; }),
    kofiSend: () => edit((d) => {
      const q = d.kofi.input.trim();
      if (!q || d.kofi.msgs.some((m) => m.streaming)) return;
      const r = kofiReply(q, d);
      d.kofi.input = "";
      d.kofi.msgs.push({ id: nid(), role: "user", content: q }, { id: nid(), role: "assistant", content: "", full: r.content, actions: r.actions, streaming: true });
    }),
    runAction: (mid, i) => edit((d) => {
      const a = d.kofi.msgs.find((m) => m.id === mid).actions[i];
      if (a.done) return;
      a.done = true;
      if (a.type === "START_FOCUS" && d.focus.mode === "idle") {
        startFocus(d, a.work, PRESETS.find((p) => p.work === a.work)?.brk ?? 5, a.title);
        view(d, "focus");
      }
      if (a.type === "CREATE_TASK" && a.task.due === TODAY) d.tasks.push({ id: nid(), ...a.task, done: false, fresh: true });
    }),
    closeLevel: () => edit((d) => { d.levelUp = null; }),
  };

  const fade = auto && !reduce ? Math.max(0, (t - (script.total - 450)) / 450) : 0;

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden bg-[#18181b]"
      style={{ overflow: "clip" }} // never let focus scroll the scaled canvas sideways
      onPointerDownCapture={takeOver}
      onWheelCapture={takeOver}
      onKeyDownCapture={takeOver}
    >
      <style>{STYLE}</style>
      <div
        className={`iq absolute left-0 top-0 origin-top-left ${full ? "" : "pointer-events-none select-none"}`}
        style={{ width: W, height: H, transform: `scale(${scale})`, visibility: scale ? "visible" : "hidden" }}
        aria-hidden={full ? undefined : "true"}
      >
        <Sidebar s={s} onKofi={act.openKofi} press={s.press} />
        <main ref={mainRef} className="iq-scroll absolute inset-y-0 left-64 right-0 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-5xl px-8 py-6">
            <div className="space-y-8">
              <Header onBrainDump={act.openBd} press={s.press} synced={full} />
              <div className="space-y-6">
                {full && <Briefing s={s} />}
                <section>
                  <SectionTitle dot="acc">Overview</SectionTitle>
                  <Stats s={s} tight={!full} />
                </section>
                {full && (
                  <div className="grid grid-cols-2 gap-6">
                    <section ref={focusRef}>
                      <SectionTitle dot="hi">Focus</SectionTitle>
                      <Focus s={s} act={act} press={s.press} />
                    </section>
                    <section><Habits s={s} act={act} /></section>
                  </div>
                )}
                {full && <div className="h-px" style={{ background: "linear-gradient(to right, rgba(var(--acc),0.3), var(--line), transparent)" }} />}
                <Today s={s} act={act} press={s.press} schedule={full} sectionRef={todayRef} />
              </div>
            </div>
          </div>
        </main>
        {s.bd && <BrainDump bd={s.bd} act={act} press={s.press} compact={!full} />}
        <Kofi kofi={s.kofi} open={s.kofiOpen} act={act} press={s.press} />
        <XpToasts fx={s.fx} />
        {s.levelUp && <LevelUp level={s.levelUp} onClose={act.closeLevel} />}
        {fade > 0 && <div className="pointer-events-none absolute inset-0 z-[80] bg-[#18181b]" style={{ opacity: fade * 0.9 }} />}
      </div>
      {full && (
        <div className="absolute bottom-2 left-[calc(21.33%+8px)] z-10 flex items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={replay}
            className="flex items-center gap-1.5 rounded border border-white/15 bg-black/60 px-2 py-1 text-white/70 transition-colors hover:border-white/40 hover:text-white"
          >
            <RotateCcw size={12} /> Replay
          </button>
          {auto && !reduce && !s.bd && <span className="rounded bg-black/60 px-2 py-1 text-[10px] text-white/50">Demo playing, click anything to take over</span>}
        </div>
      )}
    </div>
  );
}
