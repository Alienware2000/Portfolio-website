import { glyphBounds, typeset } from "./math.js";
import { handLoop, handwrite } from "./hand.js";
import { TUTOR } from "./lessons.js";

/*
 * Turns a lesson script into absolute times. Reveal pacing follows
 * lib/whiteboard/reveal.ts: strokes draw for 520 ms, writing appears one glyph
 * at a time after them, and groups enter one after another.
 */

export const STROKE_MS = 520;
export const GLYPH_MS = 38;
export const FADE_MS = 80;

const labelDelays = (text) => {
  let at = 0;
  return [...text].map((ch) => {
    const d = at;
    at += /\s/.test(ch) ? 16 : GLYPH_MS;
    return d;
  });
};

function prepare(el) {
  if (el.k === "math") {
    const box = typeset(el.tex);
    const left = el.anchor === "middle" ? el.x - (box.w * el.s) / 2 : el.x;
    const delays = box.items.map((_, i) => i * GLYPH_MS);
    return { ...el, box, left, delays, dur: delays.length * GLYPH_MS + FADE_MS };
  }
  if (el.k === "label") {
    const text = el.runs ? el.runs.map((r) => r.text).join(" ") : el.text;
    const delays = labelDelays(text);
    return { ...el, c: el.c ?? (el.heading ? TUTOR.muted : TUTOR.ink), delays, dur: (delays.at(-1) ?? 0) + GLYPH_MS + FADE_MS };
  }
  return { ...el, c: el.c ?? TUTOR.ink };
}

export function buildSchedule(lesson) {
  const groups = Object.fromEntries(Object.entries(lesson.groups).map(([id, els]) => [id, els.map(prepare)]));
  const marks = [];
  const inks = [];
  const groupStart = {};
  let at = 0, notesAt = Infinity;

  const beats = lesson.beats.map((b) => {
    const beat = { ...b, start: at, end: at + b.dur };
    at += b.dur;
    if (b.notes && notesAt === Infinity) notesAt = beat.start;

    // Visuals start with their sentence, then enter one group at a time
    let cursor = beat.start + 90;
    for (const id of b.draw ?? []) {
      groupStart[id] = cursor;
      let local = 0;
      const els = groups[id];
      if (els.some((e) => e.k !== "math" && e.k !== "label")) local = STROKE_MS;
      for (const el of els) {
        if (el.k === "math" || el.k === "label") {
          marks.push({ ...el, gid: id, start: cursor + local });
          local += el.dur + 80;
        } else {
          marks.push({ ...el, gid: id, start: cursor });
        }
      }
      cursor += Math.max(560, local);
    }

    // The student's pen writes while they talk
    let pen = beat.start + 260;
    for (const id of b.ink ?? []) {
      for (const stroke of resolveInk(lesson.ink[id], groups)) {
        inks.push({ ...stroke, id: `${id}-${inks.length}`, start: pen });
        pen += stroke.dur + 60;
      }
    }
    return beat;
  });

  const bottoms = {};
  for (const m of marks) {
    const bottom = m.k === "math" ? m.y + m.box.desc * m.s : m.k === "label" ? m.y + 10 : pathBottom(m.d);
    bottoms[m.gid] = Math.max(bottoms[m.gid] ?? 0, bottom);
  }
  for (const ink of inks) ink.bottom = pathBottom(ink.d);

  return {
    lesson,
    beats,
    marks,
    inks,
    groupStart,
    bottoms,
    notesAt,
    total: at,
    coverFrom: beats[lesson.coverFrom].start,
    poster: beats[lesson.poster].start - 1,
  };
}

function pathBottom(d) {
  const ys = [...d.matchAll(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g)].map((m) => Number(m[2]));
  const vs = [...d.matchAll(/V(-?\d*\.?\d+)/g)].map((m) => Number(m[1]));
  return Math.max(0, ...ys, ...vs);
}

function resolveInk(spec, groups) {
  if (spec.kind === "path") return spec.strokes;
  const anchor = (gid) => groups[gid].find((e) => e.k === "math");
  if (spec.kind === "loop") {
    const m = anchor(spec.g);
    const b = glyphBounds(m.box, m.s, spec.from, spec.to);
    const box = { left: m.left + b.left, right: m.left + b.right, top: m.y + b.top, bottom: m.y + b.bottom };
    return [{ d: handLoop(box, ...spec.pad), dur: 650 }];
  }
  if (spec.kind === "write") {
    let { x, y } = spec;
    if (spec.after) {
      const m = anchor(spec.after);
      x = m.left + m.box.w * m.s + spec.dx;
      y = m.y + spec.dy;
    }
    return handwrite(spec.text, x, y, spec.k);
  }
  return [];
}

/** Where the conversation is at time t: orb state, captions, desk view. */
export function frameAt(S, t) {
  let index = S.beats.length - 1;
  for (let i = 0; i < S.beats.length; i++) {
    if (t < S.beats[i].end) { index = i; break; }
  }
  const beat = S.beats[index];
  const turns = [];
  for (const b of S.beats) {
    if (!b.say || b.start > t) continue;
    const last = turns[turns.length - 1];
    if (b.who === "tutor" && last?.role === "tutor") last.text += ` ${b.say}`;
    else turns.push({ role: b.who === "tutor" ? "tutor" : "student", text: b.say, at: b.start });
  }
  const orb = beat.who === "tutor" ? "speaking" : beat.who === "student" ? "thinking" : "listening";
  return { index, beat, orb, recording: beat.who === "listen", turns, notes: t >= S.notesAt };
}
