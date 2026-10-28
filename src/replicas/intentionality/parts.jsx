import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AlertTriangle, ArrowUpRight, BarChart3, Bell, BookOpen, Bot, Brain, Calendar, CalendarClock, CalendarDays, Check,
  CheckCircle, CheckSquare, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Cloud, Coffee, Crown, EyeOff, Flag,
  Flame, Heart, HelpCircle, History, Inbox, LayoutDashboard, Loader2, LogOut, Palette, Pause, Pencil, Play, Plus,
  PlusCircle, RefreshCw, Send, Settings, SkipForward, Sparkles, Target, Trash2, Trophy, User, Users, Volume2, X, Zap,
} from "lucide-react";
import { BLOCKS, DISPLAY_DATE, NOW_MIN, PRESETS, QUEST_COUNT, TASK_XP, TODAY, focusXp, levelInfo, proRatedXp } from "./data.js";

const cx = (...c) => c.filter(Boolean).join(" ");
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fmtTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
const fmtMin = (min) => fmtTime(`${Math.floor(min / 60)}:${min % 60}`);
const fmtCount = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
const shortDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** Number that springs from its old value to the new one, like DashboardStats' AnimatedNumber. */
function CountUp({ value }) {
  const [shown, setShown] = useState(value);
  const [flash, setFlash] = useState(0);
  const from = useRef(value);
  useEffect(() => {
    if (from.current === value) return;
    const start = from.current;
    from.current = value;
    if (reduced()) { setShown(value); return; }
    setFlash((f) => f + 1);
    const t0 = performance.now();
    const id = setInterval(() => {
      const p = Math.min((performance.now() - t0) / 700, 1);
      setShown(Math.round(start + (value - start) * (1 - Math.pow(1 - p, 3))));
      if (p === 1) clearInterval(id);
    }, 30);
    return () => { clearInterval(id); setShown(value); };
  }, [value]);
  return <span key={flash} className={cx("rounded-md", flash > 0 && "iq-flash")}>{shown.toLocaleString()}</span>;
}

/* ------------------------------------------------------------------ Sidebar */

const NAV = [
  ["Dashboard", LayoutDashboard], ["Week", Calendar], ["Quests", Target], ["Thoughts", Inbox], ["Review", BookOpen],
  ["Analytics", BarChart3], ["Leaderboard", Trophy], ["Social", Users], ["Settings", Settings],
].map(([label, icon]) => ({ label, icon }));

export function StreakBadge({ streak }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-[rgba(var(--fire),0.2)] bg-[rgba(var(--fire),0.1)] px-2.5 py-1.5">
      <Flame size={14} className="text-[rgb(var(--fire))]" fill="currentColor" />
      <span key={streak} className="iq-pop font-mono text-xs font-bold text-[rgb(var(--fire))]">{streak}</span>
      <span className="text-xs text-[var(--t3)]">days</span>
    </div>
  );
}

export function XpBar({ xp }) {
  const { pct } = levelInfo(xp);
  const near = pct >= 80;
  return (
    <div className={cx("relative h-1 w-full overflow-hidden rounded-full bg-[var(--elev)]", near && "iq-pulse-acc")}>
      <div
        className="relative h-full overflow-hidden rounded-full"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(to right, rgb(var(--acc)), color-mix(in srgb, rgb(var(--acc)) 80%, rgb(var(--hi))))",
          transition: "width 900ms cubic-bezier(0.34, 1.45, 0.64, 1)",
        }}
      >
        {near && <div className="iq-shimmer" />}
      </div>
    </div>
  );
}

export function Sidebar({ s, onKofi, press }) {
  const lv = levelInfo(s.xp);
  return (
    <aside className="glass absolute inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[var(--line)]">
      <div className="flex shrink-0 items-center justify-between p-6 pb-4">
        <h1 className="text-sm font-bold uppercase tracking-widest">Intentionality</h1>
        <span className="rounded-lg p-1.5 text-[rgb(var(--hi))]"><Crown size={14} /></span>
      </div>
      <div className="shrink-0 px-6 pb-4">
        <button
          type="button"
          onClick={onKofi}
          className={cx(
            "flex w-full items-center gap-3 rounded-xl border border-[rgba(var(--acc),0.2)] bg-[rgba(var(--acc),0.1)] px-4 py-3 transition-all duration-200 hover:bg-[rgba(var(--acc),0.2)]",
            press === "kofi" && "iq-press"
          )}
        >
          <Sparkles size={20} className="text-[rgb(var(--acc))]" />
          <span className="whitespace-nowrap font-medium">Ask Kofi</span>
          <span className="ml-auto whitespace-nowrap text-xs text-[var(--t3)]">Ctrl+Shift+K</span>
        </button>
      </div>
      <div className="shrink-0 px-6 pb-4">
        <div className="-mx-3 space-y-3 rounded-lg p-3">
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span key={lv.level} className="iq-pop font-mono text-2xl font-bold text-[rgb(var(--acc))]" style={{ textShadow: "0 0 15px rgba(var(--acc),0.35)" }}>
                LVL {lv.level}
              </span>
              <span className="font-mono text-xs text-[rgb(var(--hi))]" style={{ textShadow: "0 0 8px rgba(var(--hi),0.2)" }}>
                <CountUp value={s.xp} /> XP
              </span>
            </div>
            <span className="inline-block rounded-lg border border-[rgba(var(--hi),0.3)] bg-[rgba(var(--hi),0.15)] px-2.5 py-1 text-xs font-medium text-[rgb(var(--hi))]">
              {lv.title}
            </span>
          </div>
          <XpBar xp={s.xp} />
        </div>
      </div>
      <div className="mx-6 h-px shrink-0 bg-[var(--line)]" />
      <nav className="iq-scroll min-h-0 flex-1 space-y-1 overflow-y-auto p-6">
        {NAV.map((item, i) => (
          <div
            key={item.label}
            className={cx(
              "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150",
              i === 0 ? "bg-[var(--card)] text-[var(--t1)]" : "text-[var(--t2)]"
            )}
          >
            {i === 0 && <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[rgb(var(--acc))]" />}
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </nav>
      <div className="flex shrink-0 items-center justify-between border-t border-[var(--line)] p-4">
        <StreakBadge streak={s.streak} />
        <div className="flex items-center gap-1 text-[var(--t3)]">
          <span className="p-2"><Palette size={16} className="text-[#dc2626]" /></span>
          <span className="p-2"><HelpCircle size={16} /></span>
          <span className="p-2"><ChevronLeft size={16} /></span>
          <span className="p-2"><LogOut size={16} /></span>
        </div>
      </div>
    </aside>
  );
}

/* --------------------------------------------------------- Header + briefing */

export function Header({ onBrainDump, press, synced }) {
  const chip = "flex items-center gap-2 whitespace-nowrap rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--t2)] transition-all duration-200";
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-sm font-bold uppercase tracking-widest">Command Center</h1>
        <div className="mt-1 flex items-center gap-4">
          <p className="font-mono text-sm text-[var(--t3)]">{DISPLAY_DATE}</p>
          {synced && (
            <div className="flex items-center gap-2 text-[var(--t3)]">
              <Cloud size={14} className="text-[rgb(var(--ok))]" />
              <span className="font-mono text-xs">Synced 12m ago</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onBrainDump} className={cx(chip, "hover:border-[rgb(var(--acc))] hover:text-[rgb(var(--acc))]", press === "bd" && "iq-press !border-[rgb(var(--acc))] !text-[rgb(var(--acc))]")}>
          <Brain size={16} />
          <span>Brain Dump</span>
          <kbd className="rounded bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--t3)]">⌘K</kbd>
        </button>
        <div className={chip}><Inbox size={16} /><span>Thoughts</span></div>
        <div className={chip}><BarChart3 size={16} /><span>Analytics</span></div>
        <div className="relative rounded-lg p-2">
          <Bell size={20} className="text-[var(--t1)]" />
          <div className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[var(--card)] bg-red-500 px-1 text-[10px] font-bold text-white">2</div>
        </div>
      </div>
    </header>
  );
}

// Same rules as app/lib/smart-recommendations.ts, evaluated at 6:40 PM
function recommendations(s) {
  const anyDone = s.tasks.some((t) => t.done) || s.habits.some((h) => h.done);
  const left = s.habits.filter((h) => !h.done).length;
  const recs = [];
  if (!anyDone) recs.push({ icon: Flame, tone: "fire", title: "Streak at risk!", desc: `You have a ${s.streak}-day streak. Complete something to keep it going!`, action: "View Tasks" });
  if (left > 0) recs.push({ icon: Heart, tone: "acc", title: left === 1 ? "Don't forget your habit!" : `${left} habits remaining`, desc: left === 1 ? `"${s.habits.find((h) => !h.done).title}" still needs to be done today` : "You still have daily habits to complete", action: "View Habits" });
  recs.push({ icon: BookOpen, tone: "ok", title: "Time for daily review", desc: "Reflect on your day and plan for tomorrow. Earn 20 XP!", action: "Start Review" });
  const until = 14 - s.streak;
  if (until > 0 && until <= 3) recs.push({ icon: Trophy, tone: "fire", title: until === 1 ? "Tomorrow is your 14-day streak!" : `${until} days until your 14-day streak!`, desc: "Keep the momentum going - you're almost there!", action: "View Analytics" });
  return recs.slice(0, 3);
}

function encouragement(s) {
  const done = s.tasks.filter((t) => t.done).length;
  const p = done / s.tasks.length;
  if (p === 1) return "All done for today!";
  if (p >= 0.75) return "Almost there! You're crushing it today.";
  if (p >= 0.5) return "Great progress! Keep the momentum going.";
  if (p > 0) return "Good start! Focus on your high-priority items.";
  return "The day's not over yet. You've got this!";
}

export function Briefing({ s }) {
  return (
    <div className="glass-p relative overflow-hidden rounded-xl">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[rgba(var(--hi),0.1)] p-2"><Sparkles size={18} className="text-[rgb(var(--hi))]" /></div>
          <div>
            <h3 className="text-sm font-semibold">Good evening, Maya!</h3>
            <p className="text-xs text-[var(--t3)]">{encouragement(s)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[var(--t3)]">
          <span className="p-1.5"><EyeOff size={14} /></span>
          <span className="p-1.5"><RefreshCw size={14} /></span>
          <ChevronUp size={18} />
        </div>
      </div>
      <div className="space-y-2 px-4 pb-4">
        {recommendations(s).map((r) => (
          <div key={r.title} className="iq-in flex items-start gap-3 rounded-lg bg-[var(--elev)] p-3">
            <div className={cx("shrink-0 rounded-lg p-1.5", TONE_BG[r.tone])}><r.icon size={14} className={TONE_TEXT[r.tone]} /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{r.title}</p>
              <p className="mt-0.5 text-xs text-[var(--t3)]">{r.desc}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--card)] px-2 py-1 text-xs font-medium text-[var(--t2)]">
              {r.action} <ChevronRight size={12} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const TONE_BG = { acc: "bg-[rgba(var(--acc),0.1)]", ok: "bg-[rgba(var(--ok),0.1)]", fire: "bg-[rgba(var(--fire),0.1)]", hi: "bg-[rgba(var(--hi),0.1)]", none: "bg-[var(--elev)]" };
const TONE_TEXT = { acc: "text-[rgb(var(--acc))]", ok: "text-[rgb(var(--ok))]", fire: "text-[rgb(var(--fire))]", hi: "text-[rgb(var(--hi))]", none: "text-[var(--t3)]" };
const TONE_BORDER = { acc: "border-[rgba(var(--acc),0.2)]", ok: "border-[rgba(var(--ok),0.2)]", fire: "border-[rgba(var(--fire),0.2)]", hi: "border-[rgba(var(--hi),0.2)]", none: "border-[var(--line)]" };

export function SectionTitle({ dot, children, right }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--t3)]">
        <span className={TONE_TEXT[dot] || dot}>●</span> {children}
      </h2>
      {right}
    </div>
  );
}

/* -------------------------------------------------------------------- Stats */

function Stat({ icon, tone, value, of, label, tight }) {
  const Icon = icon;
  return (
    <div className={cx("min-h-[72px] rounded-xl border bg-[var(--card)] transition-all duration-200", tight ? "p-3" : "p-4", TONE_BORDER[tone])}>
      <div className="flex items-center gap-3">
        <div className={cx("rounded-lg p-2.5", TONE_BG[tone], TONE_TEXT[tone])}><Icon size={18} /></div>
        <div className="min-w-0 flex-1">
          <p
            className={cx("font-mono text-xl font-bold leading-tight", tone === "none" ? "text-[var(--t1)]" : TONE_TEXT[tone])}
            style={tone === "none" ? undefined : { textShadow: `0 0 12px rgba(var(--${tone}),0.3)` }}
          >
            <CountUp value={value} />
            {of !== undefined && <span className="text-[var(--t3)]">/{of}</span>}
          </p>
          <p className="truncate text-xs leading-snug text-[var(--t3)]">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function Stats({ s, tight }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      <Stat icon={Heart} tone="acc" value={s.habits.filter((h) => h.done).length} of={s.habits.length} label="habits today" tight={tight} />
      <Stat icon={CheckCircle} tone="ok" value={s.tasks.filter((t) => t.done).length} of={s.tasks.length} label="tasks today" tight={tight} />
      <Stat icon={Zap} tone="hi" value={s.xp} label="total XP" tight={tight} />
      <Stat icon={Flame} tone="fire" value={s.streak} label="day streak" tight={tight} />
      <Stat icon={Target} tone="none" value={0} of={QUEST_COUNT} label="quests done" tight={tight} />
    </div>
  );
}

/* -------------------------------------------------------------------- Tasks */

const PRIORITY = {
  high: ["HIGH", "bg-[rgba(var(--high),0.1)] text-[rgb(var(--high))]"],
  medium: ["MED", "bg-[rgba(var(--med),0.1)] text-[rgb(var(--med))]"],
  low: ["LOW", "bg-[rgba(var(--low),0.1)] text-[rgb(var(--low))]"],
};
const RANK = { high: 0, medium: 1, low: 2 };

function Pill({ p }) {
  return <span className={cx("shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide", PRIORITY[p][1])}>{PRIORITY[p][0]}</span>;
}

/** DayTimeline order: scheduled first, incomplete before complete, then priority, then time. */
function sortTasks(tasks) {
  const by = (a, b) => (a.done - b.done) || (RANK[a.priority] - RANK[b.priority]) || (a.time || "").localeCompare(b.time || "");
  return [...tasks.filter((t) => t.time).sort(by), ...tasks.filter((t) => !t.time).sort(by)];
}

// Entrance animation only on first mount; reordering moves the DOM node and would replay it
function useEnter(fresh) {
  const [enter, setEnter] = useState(!!fresh);
  useEffect(() => {
    if (!enter) return;
    const id = setTimeout(() => setEnter(false), 400);
    return () => clearTimeout(id);
  }, [enter]);
  return enter;
}

function TaskRow({ t, act, press, rowRef }) {
  const enter = useEnter(t.fresh);
  return (
    <div
      ref={rowRef}
      className={cx(
        "group flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 transition-[background-color,border-color,opacity] duration-200 hover:border-[var(--line2)] hover:bg-[var(--hover)]",
        t.done && "opacity-60",
        enter && "iq-in"
      )}
    >
      <button
        type="button"
        onClick={() => act.toggleTask(t.id)}
        aria-label={t.done ? "Mark task incomplete" : "Mark task complete"}
        className={cx(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors",
          t.done ? "border-[rgb(var(--acc))] bg-[rgb(var(--acc))]" : "border-[var(--line2)] hover:border-[rgb(var(--acc))]",
          press === t.id && "iq-press"
        )}
      >
        {t.done && <Check size={14} className="iq-pop text-white" />}
      </button>
      {t.time && <span className="font-mono text-xs text-[var(--t3)]">{fmtTime(t.time)}</span>}
      <button type="button" onClick={() => act.toggleTask(t.id)} className={cx("min-w-0 flex-1 truncate text-left text-sm font-medium", t.done ? "text-[var(--t3)] line-through" : "text-[var(--t1)]")}>
        {t.title}
      </button>
      <Pill p={t.priority} />
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!t.done && (
          <button type="button" onClick={() => act.focusTask(t)} title="Start focus session" className="rounded p-1 text-[rgb(var(--acc))] hover:bg-[var(--elev)]">
            <Play size={14} />
          </button>
        )}
        {!t.done && <span className="rounded p-1 text-[var(--t3)]"><CalendarClock size={14} /></span>}
        <span className="rounded p-1 text-[var(--t3)]"><Pencil size={14} /></span>
        <span className="rounded p-1 text-[var(--t3)]"><Trash2 size={14} /></span>
      </div>
      <span className={cx("rounded bg-[var(--elev)] px-1.5 py-0.5 font-mono text-xs", t.done ? "text-[rgb(var(--ok))]" : "text-[var(--t3)]")}>+{TASK_XP}</span>
    </div>
  );
}

/** Task list with a small FLIP so completed tasks glide to the bottom like the real layout animation. */
function TaskList({ tasks, act, press }) {
  const rows = useRef(new Map());
  const last = useRef(new Map());
  const order = sortTasks(tasks);
  const key = order.map((t) => t.id).join();
  useLayoutEffect(() => {
    const next = new Map();
    rows.current.forEach((el, id) => {
      if (!el) return;
      next.set(id, el.offsetTop);
      const prev = last.current.get(id);
      if (prev !== undefined && prev !== el.offsetTop && !reduced()) {
        el.animate([{ transform: `translateY(${prev - el.offsetTop}px)` }, { transform: "none" }], { duration: 260, easing: "ease-out" });
      }
    });
    last.current = next;
  }, [key]);
  const scheduled = order.filter((t) => t.time);
  const loose = order.filter((t) => !t.time);
  const row = (t) => <TaskRow key={t.id} t={t} act={act} press={press} rowRef={(el) => (el ? rows.current.set(t.id, el) : rows.current.delete(t.id))} />;
  return (
    <div className="relative space-y-3">
      <div className="space-y-2">{scheduled.map(row)}</div>
      <div className="space-y-2">{loose.map(row)}</div>
      <div className="pt-1">
        <div className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--line2)] py-2 text-sm text-[var(--t3)]">
          <Plus size={14} /><span>Add task</span>
        </div>
      </div>
    </div>
  );
}

function Schedule() {
  const from = 13 * 60;
  const y = (min) => ((min - from) / 60) * 40 + 10;
  return (
    <div className="glass-e overflow-hidden rounded-xl border border-[var(--line)]">
      <div className="relative" style={{ height: 410 }}>
        {Array.from({ length: 11 }, (_, i) => 13 + i).map((h) => (
          <div key={h} className="absolute left-0 right-0 flex items-start" style={{ top: y(h * 60) }}>
            <span className={cx("w-12 -translate-y-1/2 select-none pr-2 text-right font-mono text-[10px]", "text-[var(--t3)]")}>{fmtMin(h * 60).replace(":00", "")}</span>
            <div className={cx("flex-1 border-t", h === 23 ? "border-dashed border-[var(--line)]" : "border-[var(--line)]")} />
          </div>
        ))}
        {BLOCKS.map((b) => (
          <div
            key={b.title}
            className="absolute overflow-hidden border border-l-2 border-[var(--line)] p-1"
            style={{ top: y(b.start), height: ((b.end - b.start) / 60) * 40, left: 52, right: 8, borderRadius: 6, backgroundColor: `${b.color}12`, borderLeftColor: b.color, opacity: b.end < NOW_MIN ? 0.75 : 1 }}
          >
            <p className="truncate text-xs font-medium">{b.title}</p>
          </div>
        ))}
        <div className="absolute left-0 right-0 z-10 flex items-center" style={{ top: y(NOW_MIN) }}>
          <div className="flex w-12 justify-end pr-1"><div className="h-2 w-2 rounded-full bg-[rgb(var(--acc))]" /></div>
          <div className="h-[2px] flex-1" style={{ background: "linear-gradient(90deg, rgb(var(--acc)) 0%, rgb(var(--acc)) 70%, rgba(var(--acc),0.3) 100%)" }} />
          <span className="ml-2 mr-1 whitespace-nowrap rounded bg-[rgb(var(--acc))] px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">{fmtMin(NOW_MIN)}</span>
        </div>
      </div>
    </div>
  );
}

export function Today({ s, act, press, schedule, sectionRef }) {
  const small = (Icon, label) => (
    <div className="mb-6 flex items-center gap-2">
      <Icon size={14} className="text-[var(--t3)]" />
      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--t3)]">{label}</h3>
    </div>
  );
  return (
    <section ref={sectionRef}>
      <SectionTitle dot="text-[rgb(var(--info))]" right={<span className="font-mono text-xs text-[var(--t3)]">{TODAY}</span>}>Today</SectionTitle>
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          {small(CheckSquare, "Tasks")}
          <TaskList tasks={s.tasks} act={act} press={press} />
        </div>
        {schedule && (
          <div className="w-80 shrink-0">
            {small(CalendarDays, "Schedule")}
            <Schedule />
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- Habits */

export function Habits({ s, act }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--t3)]">
          <span className="text-[rgb(var(--ok))]">●</span> Daily Habits
        </h2>
        <span className="flex items-center gap-1 text-xs text-[var(--t3)]">Track <ArrowUpRight size={12} /></span>
      </div>
      <div className="space-y-1">
        {s.habits.map((h) => (
          <div key={h.id} className={cx("group flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 transition-all duration-200", h.done && "opacity-60", h.fresh && "iq-in")}>
            <button
              type="button"
              onClick={() => act.toggleHabit(h.id)}
              aria-label={h.done ? "Mark habit incomplete" : "Mark habit complete"}
              className={cx("relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded border-2 transition-all duration-200", h.done ? "border-[rgb(var(--ok))] bg-[rgb(var(--ok))]" : "border-[var(--line2)] hover:border-[rgb(var(--acc))]")}
            >
              {h.done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path className="iq-draw" d="M5 12l5 5L19 7" /></svg>}
            </button>
            <button type="button" onClick={() => act.toggleHabit(h.id)} className={cx("min-w-0 flex-1 truncate text-left text-sm", h.done ? "text-[var(--t3)] line-through" : "")}>{h.title}</button>
            {h.streak > 0 && (
              <div className={cx("flex items-center gap-1 rounded-lg bg-[rgba(var(--fire),0.1)] px-2 py-1 text-[rgb(var(--fire))]", h.streak >= 7 && "border border-[rgba(var(--fire),0.3)]")}>
                <Flame size={12} fill="currentColor" />
                <span key={h.streak} className="iq-pop font-mono text-xs font-bold">{h.streak}</span>
              </div>
            )}
            <div className={cx("rounded-lg border px-2.5 py-1 font-mono text-xs", h.done ? "border-[rgba(var(--ok),0.2)] bg-[rgba(var(--ok),0.1)] text-[rgb(var(--ok))]" : "border-[var(--line)] bg-[var(--elev)] text-[var(--t2)]")}>
              {h.done && "+"}{TASK_XP} XP
            </div>
          </div>
        ))}
      </div>
      <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--line)] py-2.5 text-sm text-[var(--t3)]">
        <Plus size={16} /><span>Add Habit</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- Focus */

function Ring({ size, r, stroke, pct, color, track = "var(--hover)", gradient }) {
  const c = 2 * Math.PI * r;
  return (
    <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
      {gradient && (
        <defs>
          <linearGradient id="iq-focus-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--acc))" />
            <stop offset="100%" stopColor="rgb(var(--hi))" />
          </linearGradient>
        </defs>
      )}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={gradient ? "url(#iq-focus-grad)" : color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} style={{ transition: "stroke-dashoffset 300ms linear" }}
      />
    </svg>
  );
}

function Launcher({ s, act, press }) {
  const p = PRESETS[s.preset];
  const bonus = focusXp(p.work) - Math.round(p.work * 0.6);
  return (
    <div className="glass-p relative overflow-hidden rounded-xl">
      <button type="button" onClick={act.toggleLauncher} className={cx("flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--hover)]", press === "launcher" && "bg-[var(--hover)]")}>
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12">
            <Ring size={80} r={35} stroke={4} pct={25} gradient />
            <div className="absolute inset-0 flex items-center justify-center"><Play size={18} className="iq-breathe-icon ml-0.5 text-[rgb(var(--acc))]" /></div>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold">Start Focus Session</h3>
            <p className="text-xs text-[var(--t3)]">{p.work} min work • {p.brk}m break</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-0.5">
            <span className="flex items-center gap-1.5 rounded-lg bg-[rgba(var(--hi),0.1)] px-2.5 py-1 font-mono text-xs text-[rgb(var(--hi))]"><Zap size={12} />+{focusXp(p.work)} XP</span>
            <span className="text-[10px] text-[var(--t3)]">50% min to earn</span>
          </div>
          <ChevronDown size={16} className="text-[var(--t3)] transition-transform duration-200" style={{ transform: s.launcher ? "rotate(180deg)" : "none" }} />
        </div>
      </button>
      {s.launcher && (
        <div className="iq-in space-y-4 border-t border-[var(--line)] p-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--t3)]">Duration</p>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((pr, i) => (
                <button
                  key={pr.work}
                  type="button"
                  onClick={() => act.setPreset(i)}
                  className={cx("rounded-lg px-3 py-2 text-sm font-medium transition-all", i === s.preset ? "bg-[rgb(var(--acc))] text-white" : "border border-[var(--line)] bg-[var(--elev)] text-[var(--t3)] hover:bg-[var(--hover)]")}
                >
                  {pr.work} min
                </button>
              ))}
              <span className="rounded-lg border border-[var(--line)] bg-[var(--elev)] px-3 py-2 text-center text-sm font-medium text-[var(--t3)]">Custom</span>
            </div>
          </div>
          {bonus > 0 && (
            <div className="rounded-lg border border-[rgba(var(--hi),0.2)] bg-[rgba(var(--hi),0.1)] px-3 py-2 text-xs text-[rgb(var(--hi))]">
              Includes +{bonus} XP milestone bonus for {p.work}+ min focus!
            </div>
          )}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--t3)]">Session Title (Optional)</p>
            <div className="w-full rounded-lg border border-[var(--line2)] bg-[var(--elev)] px-3 py-2 text-sm text-[var(--t3)]">What are you working on?</div>
          </div>
          <button type="button" onClick={() => act.startFocus(p.work, p.brk, "")} className={cx("flex w-full items-center justify-center gap-2 rounded-xl bg-[rgb(var(--acc))] py-3 font-medium text-white transition-all duration-200 hover:brightness-110", press === "start" && "iq-press")}>
            <Play size={18} /> Start {p.work} min Focus
          </button>
        </div>
      )}
    </div>
  );
}

function Timer({ f, act }) {
  const isBreak = f.mode === "break";
  const tone = isBreak ? "ok" : "acc";
  const total = (isBreak ? f.brk : f.work) * 60;
  const pct = ((total - f.remaining) / total) * 100;
  const worked = (isBreak || f.mode === "completed" ? f.worked : f.work * 60 - f.remaining) / 60;
  const ratio = worked / f.work;
  const xp = proRatedXp(worked, f.work);
  const ctrl = "flex h-11 w-11 items-center justify-center rounded-xl transition-colors";

  if (f.mode === "completed") {
    return (
      <div className="glass iq-in rounded-xl border !border-[rgba(var(--hi),0.3)] p-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-4 h-32 w-32">
            <Ring size={100} r={45} stroke={4} pct={100} color="rgb(var(--hi))" track="rgba(var(--hi),0.2)" />
            <div className="iq-pop absolute inset-0 flex items-center justify-center"><Check size={48} className="text-[rgb(var(--hi))]" /></div>
          </div>
          <h3 className="mb-2 text-lg font-bold text-[rgb(var(--hi))]">Session Complete!</h3>
          {f.title && <p className="mb-4 max-w-full truncate text-center text-sm text-[var(--t2)]">{f.title}</p>}
          <div className="mb-2 flex items-center gap-2">
            <Zap size={24} className="text-[rgb(var(--hi))]" />
            <span className="font-mono text-3xl font-bold text-[rgb(var(--hi))]">+{xp} XP</span>
          </div>
          <p className="mb-6 text-xs text-[var(--t3)]">{Math.round(worked)} min of {f.work} min</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={act.completeFocus} className="flex min-h-[48px] items-center gap-2 rounded-xl bg-[rgb(var(--hi))] px-6 py-3 font-medium text-black">
              <Zap size={18} /> Claim XP
            </button>
            <button type="button" onClick={act.abandonFocus} title="Discard session" className={cx(ctrl, "bg-[var(--elev)] hover:bg-[var(--hover)]")}><X size={18} className="text-[var(--t3)]" /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("glass-p relative overflow-hidden rounded-xl p-6", f.running && !isBreak && "iq-breathing")}>
      <div className="flex flex-col items-center">
        <div className="relative mb-4 h-48 w-48">
          {f.running && !isBreak && <div className="iq-glow absolute inset-0 rounded-full bg-[rgba(var(--acc),0.1)] blur-xl" />}
          <div className="relative h-full w-full"><Ring size={100} r={45} stroke={6} pct={pct} color={`rgb(var(--${tone}))`} /></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={cx("rounded-lg border px-5 py-2", isBreak ? "border-[rgba(var(--ok),0.2)]" : "border-[rgba(var(--acc),0.2)]")}
              style={{ background: "rgba(24,24,27,0.8)", boxShadow: `0 0 15px rgba(var(--${tone}),0.15), inset 0 0 15px rgba(var(--${tone}),0.05)` }}
            >
              <span className={cx("font-mono text-4xl font-bold", isBreak ? "text-[rgb(var(--ok))]" : "text-[var(--t1)]")} style={{ textShadow: `0 0 20px rgba(var(--${tone}),0.35)` }}>
                {fmtCount(f.remaining)}
              </span>
            </div>
            <span className="mt-1 flex items-center gap-1 text-xs uppercase tracking-wide text-[var(--t3)]">
              {isBreak ? <><Coffee size={12} /> Break Time</> : f.running ? "Focusing..." : "Paused"}
            </span>
          </div>
        </div>
        <div className="mb-4 flex items-center justify-center gap-4">
          {f.title && <span className="max-w-[200px] truncate text-sm text-[var(--t2)]">{f.title}</span>}
          {!isBreak && (
            <span className={cx("flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-xs", ratio < 0.5 ? "bg-[var(--hover)] text-[var(--t3)]" : "bg-[rgba(var(--hi),0.1)] text-[rgb(var(--hi))]")}>
              <Zap size={12} />+{xp} XP
              {ratio < 0.5 && <span className="ml-1 text-[10px] opacity-70">({Math.round(ratio * 100)}% of 50%)</span>}
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={act.pauseFocus}
            aria-label={f.running ? "Pause" : "Resume"}
            className={cx("flex h-14 w-14 items-center justify-center rounded-full transition-colors", isBreak ? "bg-[rgb(var(--ok))]" : "bg-[rgb(var(--acc))] hover:brightness-110")}
          >
            {f.running ? <Pause size={24} className="text-white" /> : <Play size={24} className="ml-1 text-white" />}
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={act.skipFocus} title={isBreak ? "End break" : "Skip to break"} className={cx(ctrl, "bg-[var(--elev)] hover:bg-[var(--hover)]")}><SkipForward size={18} className="text-[var(--t3)]" /></button>
            {!isBreak && <button type="button" onClick={act.completeFocus} title="Complete session" className={cx(ctrl, "bg-[rgb(var(--ok))] hover:brightness-110")}><Check size={18} className="text-white" /></button>}
            <button type="button" onClick={act.abandonFocus} title="Abandon session" className={cx(ctrl, "bg-[var(--elev)] hover:bg-[rgba(var(--acc),0.2)]")}><X size={18} className="text-[var(--t3)]" /></button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 border-t border-[rgba(255,255,255,0.04)] pt-3">
          <Volume2 size={16} className="text-[var(--t2)]" />
          <div className="relative h-1 w-20 rounded-full bg-[var(--hover)]"><div className="absolute inset-y-0 left-0 w-[70%] rounded-full bg-[rgb(var(--acc))]" /><div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[rgb(var(--acc))]" style={{ left: "calc(70% - 6px)" }} /></div>
        </div>
      </div>
    </div>
  );
}

export function Focus({ s, act, press }) {
  return s.focus.mode === "idle" ? <Launcher s={s} act={act} press={press} /> : <Timer f={s.focus} act={act} />;
}

/* --------------------------------------------------------------- Brain Dump */

const TYPE_ICON = { task: [Plus, "acc"], habit: [Heart, "pink"], quest: [Target, "ok"] };

export function BrainDump({ bd, act, press, compact }) {
  const results = bd.phase === "results";
  const all = results && bd.created.every(Boolean);
  return (
    <>
      <div className="iq-fade absolute inset-0 z-40 backdrop-blur-sm" style={{ background: "rgba(24,24,27,0.92)" }} onClick={act.closeBd} />
      <div className={cx("iq-modal glass-p iq-scroll absolute left-1/2 z-50 w-full max-w-lg overflow-y-auto rounded-xl p-6 shadow-2xl shadow-black/50", compact ? "top-[4%] max-h-[94%]" : "top-[6%] max-h-[88%]")}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[rgba(var(--acc),0.1)] p-2.5" style={{ boxShadow: "0 0 20px rgba(var(--acc),0.12)" }}><Brain size={20} className="text-[rgb(var(--acc))]" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-widest">Brain Dump</h2>
                <ProChip />
              </div>
              <p className="text-xs text-[var(--t3)]">Capture your thoughts</p>
            </div>
          </div>
          <button type="button" onClick={act.closeBd} aria-label="Close dialog" className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[var(--hover)]"><X size={18} className="text-[var(--t3)]" /></button>
        </div>
        <textarea
          value={bd.text}
          onChange={(e) => act.editBd(e.target.value)}
          rows={5}
          placeholder="What's on your mind? Try: 'Call mom tomorrow high priority' or 'Finish report by Friday at 3pm'"
          className="iq-scroll min-h-[120px] w-full resize-none rounded-xl border border-[rgb(var(--acc))] bg-[var(--elev)] px-4 py-3 text-sm text-[var(--t1)] outline-none ring-2 ring-[rgba(var(--acc),0.1)] placeholder:text-[var(--t3)]"
        />
        {results && (
          <div className="iq-in mt-3 rounded-lg border border-[rgba(var(--hi),0.2)] bg-[rgba(var(--hi),0.05)] p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-[rgb(var(--hi))]" />
                <span className="text-xs font-medium text-[rgb(var(--hi))]">AI Suggestions ({bd.sugg.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={act.createAll} disabled={all} className={cx("rounded bg-[rgba(var(--acc),0.1)] px-2 py-1 text-xs text-[rgb(var(--acc))] hover:bg-[rgba(var(--acc),0.2)] disabled:opacity-50", press === "createAll" && "iq-press")}>
                  Create All
                </button>
                <span className="text-xs text-[var(--t3)]">Hide</span>
              </div>
            </div>
            <div className="space-y-2">
              {bd.sugg.map((g, i) => {
                const [Icon, tone] = TYPE_ICON[g.type];
                const done = bd.created[i];
                return (
                  <div key={g.title} className={cx("flex items-start gap-3 rounded-lg border border-[var(--line)] bg-[var(--card)] p-2", done && "opacity-60")}>
                    <div className={cx("mt-0.5 shrink-0 rounded-lg p-1.5", tone === "pink" ? "bg-pink-500/10" : TONE_BG[tone])}>
                      <Icon size={12} className={tone === "pink" ? "text-pink-500" : TONE_TEXT[tone]} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{g.title}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded bg-[var(--elev)] px-1.5 py-0.5 text-[10px] text-[var(--t3)]">{g.type}</span>
                        {g.due && <span className="flex items-center gap-1 rounded bg-[var(--elev)] px-1.5 py-0.5 text-[10px] text-[var(--t3)]"><Calendar size={8} />{shortDate(g.due)}</span>}
                        {g.priority && <span className={cx("flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]", PRIORITY[g.priority][1])}><Flag size={8} />{g.priority}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => act.createOne(i)}
                      disabled={done}
                      className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors", done ? "bg-[rgba(var(--ok),0.1)] text-[rgb(var(--ok))]" : "text-[var(--t3)] hover:bg-[var(--hover)] hover:text-[var(--t1)]")}
                    >
                      {done ? <Check size={14} className="iq-pop" /> : <Plus size={14} />}
                    </button>
                  </div>
                );
              })}
            </div>
            {bd.notes && <p className="mt-2 text-xs italic text-[var(--t3)]">{bd.notes}</p>}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="shrink-0 text-xs text-[var(--t3)]">
            <kbd className="rounded-md border border-[var(--line)] bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--t2)]">Cmd</kbd>
            {" + "}
            <kbd className="rounded-md border border-[var(--line)] bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--t2)]">Enter</kbd>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={act.processBd}
              disabled={bd.phase === "processing" || !bd.text.trim()}
              className={cx("flex min-h-[44px] items-center gap-2 rounded-xl border border-[rgba(var(--hi),0.2)] bg-[rgba(var(--hi),0.1)] px-4 py-3 text-sm font-medium text-[rgb(var(--hi))] transition-all duration-200 hover:bg-[rgba(var(--hi),0.2)] disabled:opacity-50", press === "ai" && "iq-press")}
            >
              {bd.phase === "processing" ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
              <span>{bd.phase === "processing" ? "Processing..." : "AI Process"}</span>
            </button>
            <span className="text-xs font-medium text-[var(--t3)] opacity-60">3/20</span>
            <button type="button" onClick={act.closeBd} disabled={!bd.text.trim()} className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[rgb(var(--acc))] px-4 py-3 text-sm font-medium text-white disabled:opacity-50" style={{ boxShadow: "0 0 20px rgba(var(--acc),0.12)" }}>
              <Zap size={14} /> Capture
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ProChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--hi),0.2)] bg-[rgba(var(--hi),0.1)] px-1.5 py-0.5 text-[10px] font-medium text-[rgb(var(--hi))]">
      <Crown size={12} fill="currentColor" /><span>Pro</span>
    </span>
  );
}

/* --------------------------------------------------------------------- Kofi */

const SUGGESTED = ["What do I have to do today?", "Create a task to call mom tomorrow", "Start a 25 minute focus session"];
const ACTION_ICON = { START_FOCUS: Play, CREATE_TASK: PlusCircle };

export function Kofi({ kofi, open, act, press }) {
  const end = useRef(null);
  const last = kofi?.msgs.at(-1);
  useEffect(() => {
    const el = end.current?.parentElement;
    if (el) el.scrollTop = el.scrollHeight;
  }, [kofi?.msgs.length, last?.content, last?.actions?.length]);
  const sendable = kofi?.input.trim();
  return (
    <div
      className="absolute right-0 top-0 z-50 flex h-full w-[400px] flex-col border-l border-[var(--line)] bg-[var(--elev)] shadow-2xl"
      style={{ transform: open ? "none" : "translateX(105%)", transition: "transform 420ms cubic-bezier(0.22, 1.2, 0.36, 1)" }}
    >
      <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[rgba(var(--acc),0.2)] p-1.5"><Sparkles size={18} className="text-[rgb(var(--acc))]" /></div>
          <div>
            <div className="flex items-center gap-1.5"><h2 className="text-sm font-semibold">Kofi</h2><ProChip /></div>
            <span className="text-xs font-medium text-[var(--t3)] opacity-60">6/50</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[var(--t3)]">
          <span className="flex h-11 w-11 items-center justify-center"><History size={18} /></span>
          <span className="flex h-11 w-11 items-center justify-center"><Plus size={18} /></span>
          <button type="button" onClick={act.closeKofi} title="Close (Esc)" className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[var(--hover)]"><X size={18} /></button>
        </div>
      </div>
      <div className="iq-scroll flex-1 space-y-4 overflow-y-auto p-4">
        {kofi && kofi.msgs.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(var(--acc),0.2)]"><Sparkles size={32} className="text-[rgb(var(--acc))]" /></div>
            <h3 className="mb-2 font-semibold">Hi, I&apos;m Kofi!</h3>
            <p className="mx-auto max-w-[250px] text-sm text-[var(--t3)]">Your personal productivity assistant. Ask me anything about your tasks, schedule, or goals!</p>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-[var(--t3)]">Try asking:</p>
              {SUGGESTED.map((q) => (
                <button key={q} type="button" onClick={() => act.kofiInput(q)} className="block w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-left text-sm hover:border-[rgb(var(--acc))]">
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}
        {kofi?.msgs.map((m) => {
          const user = m.role === "user";
          return (
            <div key={m.id} className={cx("iq-in flex gap-3", user && "flex-row-reverse")}>
              <div className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", user ? "bg-[rgba(var(--acc),0.2)]" : "bg-[rgba(var(--hi),0.2)]")}>
                {user ? <User size={16} className="text-[rgb(var(--acc))]" /> : <Bot size={16} className="text-[rgb(var(--hi))]" />}
              </div>
              <div className={cx("min-w-0 max-w-[85%] flex-1", user && "text-right")}>
                <div className={cx("inline-block rounded-2xl px-4 py-3 text-left text-sm", user ? "rounded-tr-sm bg-[rgb(var(--acc))] text-white" : "rounded-tl-sm border border-[var(--line)] bg-[var(--card)]")}>
                  {m.content ? (
                    <div className="whitespace-pre-wrap break-words">
                      {m.content}
                      {m.streaming && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-[var(--t3)] align-text-bottom" />}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[var(--t3)]"><Loader2 size={14} className="animate-spin" /><span>Thinking...</span></div>
                  )}
                </div>
                {!m.streaming && m.actions?.length > 0 && (
                  <div className="iq-in mt-2 flex flex-wrap gap-2">
                    {m.actions.map((a, i) => {
                      const Icon = ACTION_ICON[a.type] || CheckCircle;
                      return (
                        <button
                          key={a.label}
                          type="button"
                          onClick={() => act.runAction(m.id, i)}
                          disabled={a.done}
                          className={cx(
                            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors",
                            a.done ? "bg-[rgba(var(--ok),0.2)] text-[rgb(var(--ok))]" : "border border-[var(--line)] bg-[var(--elev)] hover:border-[rgb(var(--acc))] hover:bg-[var(--hover)]",
                            press === `act${i}` && "iq-press !border-[rgb(var(--acc))]"
                          )}
                        >
                          {a.done ? <Check size={12} /> : <Icon size={12} />}
                          <span>{a.done ? "Done" : a.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); act.kofiSend(); }} className="border-t border-[var(--line)] p-4">
        <div className={cx("flex items-end gap-2 rounded-xl border bg-[var(--card)] transition-colors", kofi?.input ? "border-[rgb(var(--acc))]" : "border-[var(--line)]")}>
          <textarea
            value={kofi?.input || ""}
            onChange={(e) => act.kofiInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); act.kofiSend(); } }}
            placeholder="Ask Kofi anything..."
            rows={1}
            className="min-h-[44px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-[var(--t1)] outline-none placeholder:text-[var(--t3)]"
          />
          <button type="submit" disabled={!sendable} className={cx("m-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors", sendable ? "bg-[rgb(var(--acc))] text-white" : "text-[var(--t3)]", press === "send" && "iq-press")}>
            <Send size={18} />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-[var(--t3)]">Press Enter to send, Shift+Enter for new line</p>
      </form>
    </div>
  );
}

/* ----------------------------------------------------------------- Overlays */

export function XpToasts({ fx }) {
  return fx.map((f) => (
    <div key={f.id} className="iq-toast pointer-events-none absolute bottom-24 right-8 z-[60]">
      <div className="flex items-center gap-2 rounded-xl border border-[rgba(var(--hi),0.3)] bg-[var(--card)] px-4 py-2 shadow-lg" style={{ boxShadow: "0 10px 15px -3px rgba(var(--hi),0.2)" }}>
        <Zap size={18} className="text-[rgb(var(--hi))]" fill="currentColor" />
        <span className="font-mono text-lg font-bold text-[rgb(var(--hi))]">+{f.xp} XP</span>
      </div>
    </div>
  ));
}

export function LevelUp({ level, onClose }) {
  return (
    <div className="iq-fade absolute inset-0 z-[70] flex items-center justify-center backdrop-blur-sm" style={{ background: "rgba(24,24,27,0.85)" }} onClick={onClose}>
      <div className="iq-levelup flex flex-col items-center gap-4 p-8">
        <div className="rounded-full bg-[rgba(var(--hi),0.2)] p-6"><Trophy size={64} className="text-[rgb(var(--hi))]" /></div>
        <div className="text-center">
          <p className="text-lg font-bold uppercase tracking-widest text-[var(--t3)]">Level Up!</p>
          <p className="mt-2 font-mono text-6xl font-bold text-[rgb(var(--hi))]">LVL {level}</p>
        </div>
        <p className="mt-4 text-sm text-[var(--t3)]">Click anywhere to continue</p>
      </div>
    </div>
  );
}

export const STYLE = `
.iq{--base:#18181b;--elev:#1f1f23;--card:#27272a;--hover:#3f3f46;--t1:#fff;--t2:#b5b5b5;--t3:#71717a;--acc:220,38,38;--hi:251,191,36;--ok:34,197,94;--fire:249,115,22;--info:59,130,246;--high:239,68,68;--med:234,179,8;--low:82,82,82;--line:rgba(255,255,255,.08);--line2:rgba(255,255,255,.12);font-family:Geist,Inter,system-ui,sans-serif;color:var(--t1);background:var(--base);-webkit-font-smoothing:antialiased;line-height:1.5}
.iq .font-mono{font-family:"Geist Mono","JetBrains Mono",ui-monospace,monospace;font-feature-settings:"tnum" on,"lnum" on}
.iq .glass{background:rgba(39,39,42,.8);backdrop-filter:blur(12px);border:1px solid var(--line)}
.iq .glass-e{background:color-mix(in srgb,var(--card) 70%,transparent);backdrop-filter:blur(12px)}
.iq .glass-p{background:linear-gradient(135deg,rgba(39,39,42,.9) 0%,rgba(39,39,42,.75) 100%);backdrop-filter:blur(12px) saturate(150%);border:1px solid rgba(255,255,255,.08);box-shadow:0 4px 24px rgba(0,0,0,.25),0 1px 0 rgba(255,255,255,.05) inset}
.iq .iq-scroll::-webkit-scrollbar{width:6px}.iq .iq-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px}.iq .iq-scroll{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.1) transparent}
.iq .iq-shimmer{position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);animation:iq-shimmer 1.5s ease-in-out infinite}
@keyframes iq-shimmer{0%{left:-100%;opacity:0}50%{opacity:.5}100%{left:100%;opacity:0}}
.iq .iq-pulse-acc{animation:iq-pulse-acc 2s ease-in-out infinite}
@keyframes iq-pulse-acc{0%,100%{box-shadow:0 0 15px rgba(var(--acc),.15)}50%{box-shadow:0 0 25px rgba(var(--acc),.35)}}
.iq .iq-breathing{animation:iq-breathing 2s ease-in-out infinite}
@keyframes iq-breathing{0%,100%{box-shadow:0 0 20px rgba(var(--acc),.15)}50%{box-shadow:0 0 30px rgba(var(--acc),.25)}}
.iq .iq-glow{animation:iq-glow 2s ease-in-out infinite}@keyframes iq-glow{0%,100%{opacity:.15}50%{opacity:.25}}
.iq .iq-breathe-icon{animation:iq-breathe-icon 2s ease-in-out infinite}@keyframes iq-breathe-icon{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
.iq .iq-pop{display:inline-block;animation:iq-pop .45s cubic-bezier(.34,1.56,.64,1)}
@keyframes iq-pop{0%{transform:scale(.6);opacity:.2}60%{transform:scale(1.25);opacity:1}100%{transform:scale(1)}}
.iq .iq-in{animation:iq-in .25s ease-out both}@keyframes iq-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.iq .iq-fade{animation:iq-fade .2s ease-out both}@keyframes iq-fade{from{opacity:0}to{opacity:1}}
.iq .iq-modal{transform:translateX(-50%);animation:iq-modal .2s ease-out both}@keyframes iq-modal{from{opacity:0;transform:translateX(-50%) translateY(20px) scale(.95)}to{opacity:1;transform:translateX(-50%)}}
.iq .iq-flash{animation:iq-flash .6s ease-out}@keyframes iq-flash{0%{background:rgba(var(--hi),.28)}100%{background:transparent}}
.iq .iq-press{transform:scale(.96);box-shadow:0 0 0 2px rgba(var(--acc),.45)}
.iq .iq-draw{stroke-dasharray:24;animation:iq-draw .35s ease-out both}@keyframes iq-draw{from{stroke-dashoffset:24}to{stroke-dashoffset:0}}
.iq .iq-toast{animation:iq-toast 1.6s ease-out both}
@keyframes iq-toast{0%{opacity:0;transform:translateY(20px) scale(.8)}45%{opacity:1;transform:translateY(-30px) scale(1)}70%{opacity:1;transform:translateY(-30px) scale(1)}100%{opacity:0;transform:translateY(-60px) scale(.8)}}
.iq .iq-levelup{animation:iq-levelup .5s cubic-bezier(.34,1.56,.64,1) both}@keyframes iq-levelup{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.iq *{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}.iq .iq-toast{display:none}}
`;
