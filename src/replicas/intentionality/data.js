// Fake data and the real app's game math for the Intentionality replica.
// Formulas mirror app/lib/gamification.ts; every task and habit is a flat 15 XP.

export const TASK_XP = 15;
export const TODAY = "2026-10-27";
export const DISPLAY_DATE = "Tuesday, October 27, 2026";
export const NOW_MIN = 18 * 60 + 40; // 6:40 PM, the evening of a long Tuesday

const TITLES = [
  [1, "Novice"], [5, "Apprentice"], [10, "Scholar"], [15, "Adept"], [20, "Expert"],
  [25, "Master"], [30, "Grandmaster"], [35, "Legend"], [40, "Mythic"], [45, "Transcendent"], [50, "Ascended"],
];

/** Cumulative XP to reach a level: sum of floor(50 * i^1.5). */
export function xpForLevel(level) {
  let total = 0;
  for (let i = 2; i <= level; i++) total += Math.floor(50 * Math.pow(i, 1.5));
  return total;
}

export function levelInfo(xp) {
  let level = 1;
  while (level < 50 && xp >= xpForLevel(level + 1)) level++;
  const base = xpForLevel(level);
  const need = xpForLevel(level + 1) - base;
  const title = TITLES.filter(([min]) => level >= min).pop()[1];
  return { level, cur: xp - base, need, pct: Math.min(((xp - base) / need) * 100, 100), title };
}

/** Focus XP: 0.6 XP per minute plus a milestone bonus at 30/60/90 min. */
export function focusXp(minutes) {
  const bonus = minutes >= 90 ? 15 : minutes >= 60 ? 10 : minutes >= 30 ? 5 : 0;
  return Math.round(minutes * 0.6) + bonus;
}

/** Pro-rated: nothing under 50% of the planned session. */
export function proRatedXp(actual, planned) {
  if (actual / planned < 0.5) return 0;
  return focusXp(Math.min(actual, planned));
}

export const PRESETS = [
  { work: 5, brk: 1 }, { work: 10, brk: 2 }, { work: 15, brk: 3 },
  { work: 25, brk: 5 }, { work: 45, brk: 10 }, { work: 60, brk: 15 }, { work: 90, brk: 20 },
];

export const QUEST_COUNT = 5; // CHEM 161, ECON 115, CPSC 223, HIST 271, Personal

export const START = {
  xp: 4141, // one task short of Level 8
  streak: 11,
  tasks: [
    { id: "t1", title: "Finish CPSC 223 pset 4", time: "20:00", priority: "high", done: false },
    { id: "t2", title: "Submit HIST 271 reading response", time: "23:00", priority: "medium", done: false },
    { id: "t3", title: "Read SPAN 140 chapter 7", priority: "low", done: false },
    { id: "t4", title: "Review ECON 115 lecture slides", priority: "low", done: false },
  ],
  habits: [
    { id: "h1", title: "Morning stretch", streak: 4, done: false },
    { id: "h2", title: "Read 20 pages", streak: 9, done: false },
    { id: "h3", title: "No phone after midnight", streak: 2, done: false },
  ],
};

// Calendar blocks for today (minutes from midnight)
export const BLOCKS = [
  { title: "ECON 115 Lecture", start: 13 * 60, end: 14 * 60 + 15, color: "#3b82f6" },
  { title: "CHEM 161 Lab", start: 14 * 60 + 30, end: 17 * 60 + 30, color: "#22c55e" },
  { title: "Dinner with suitemates", start: 18 * 60, end: 19 * 60, color: "#f97316" },
  { title: "Library study block", start: 20 * 60, end: 22 * 60, color: "#a855f7" },
];

// What the AI pass returns for the scripted brain dumps
export const DUMP_COVER = "chem 161 lab report due thursday, email TA about midterm regrade today, gym more";
export const DUMP_FULL =
  "ugh so much this week. chem 161 lab report due thursday, econ pset 6 by friday asap, email TA about midterm regrade today, gym more";

export const SUGG_COVER = [
  { type: "task", title: "Write CHEM 161 lab report", due: "2026-10-29", priority: "medium" },
  { type: "task", title: "Email TA about midterm regrade", due: TODAY, priority: "medium" },
  { type: "habit", title: "Go to the gym", priority: "medium" },
];
export const SUGG_FULL = [
  SUGG_COVER[0],
  { type: "task", title: "Finish ECON 115 problem set 6", due: "2026-10-30", priority: "high" },
  SUGG_COVER[1],
  SUGG_COVER[2],
];
export const DUMP_NOTES = "I turned 'gym more' into a habit since it sounds like a recurring goal.";

export const KOFI_ASK = "What should I work on tonight?";
export const KOFI_REPLY =
  "You're free after dinner, and your library block runs 8 to 10 PM. I'd spend it on CPSC 223 pset 4 first since it's high priority, then knock out the HIST 271 response before 11. Want me to start a focus session?";
