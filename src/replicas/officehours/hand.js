/*
 * The student's pen. Their marks are freehand strokes, not typeset text, so the
 * board can tell "Your ink" from "Tutor notes" at a glance. Glyphs sit on a
 * baseline at y = 0 with a cap height of about 40 units, absolute commands only.
 */

const GLYPHS = {
  "2": { d: "M3,-30 C6,-42 27,-44 30,-31 C32,-22 21,-12 3,0 C12,-1 22,-1 32,-2", w: 37 },
  x: { d: "M2,-24 C9,-22 16,-6 25,0 M25,-25 C17,-18 9,-8 1,1", w: 31 },
  v: { d: "M1,-24 C4,-16 8,-6 11,0 C14,-9 18,-18 24,-26", w: 29 },
  "=": { d: "M2,-17 C9,-18 17,-18 25,-19 M3,-6 C11,-7 18,-7 26,-8", w: 32 },
  "0": { d: "M15,-39 C4,-39 1,-19 3,-9 C5,2 22,2 25,-10 C28,-24 26,-40 13,-38", w: 32 },
  "4": { d: "M19,-40 C13,-30 7,-21 2,-12 C11,-12 20,-12 29,-13 M21,-27 C20,-17 20,-8 20,2", w: 33 },
  ",": { d: "M6,-4 C7,0 6,4 1,9", w: 14 },
  "1": { d: "M3,-31 C6,-34 9,-37 12,-40 C12,-26 11,-13 11,1", w: 20 },
  "?": { d: "M3,-31 C5,-42 25,-43 25,-30 C25,-20 13,-19 13,-9 M13,0 C13.4,0.4 13.6,0.6 13.8,0.9", w: 30 },
};

const SPACE = 14;

function transformPath(d, ox, oy, k) {
  return d.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (_, x, y) => `${(ox + Number(x) * k).toFixed(1)},${(oy + Number(y) * k).toFixed(1)}`);
}

/** One stroke per character, so the pen writes them in order. */
export function handwrite(text, x, y, k = 1.4) {
  const strokes = [];
  let cursor = x;
  for (const ch of text) {
    const g = GLYPHS[ch];
    if (!g) { cursor += SPACE * k; continue; }
    strokes.push({ d: transformPath(g.d, cursor, y, k), dur: ch === "," ? 110 : 190 });
    cursor += g.w * k;
  }
  return strokes;
}

// Midpoint quadratics, as in lib/whiteboard/ink-path.ts, so loops look sampled from a real pen
export function inkPath(points) {
  if (!points.length) return "";
  const [first] = points;
  let d = `M${first.x.toFixed(1)},${first.y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i], next = points[i + 1];
    d += `Q${p.x.toFixed(1)},${p.y.toFixed(1)} ${((p.x + next.x) / 2).toFixed(1)},${((p.y + next.y) / 2).toFixed(1)}`;
  }
  const last = points[points.length - 1];
  return `${d}L${last.x.toFixed(1)},${last.y.toFixed(1)}`;
}

/** A quick hand-drawn loop around a box, overshooting where it closes. */
export function handLoop({ left, right, top, bottom }, padX = 20, padY = 16) {
  const cx = (left + right) / 2, cy = (top + bottom) / 2;
  const rx = (right - left) / 2 + padX, ry = (bottom - top) / 2 + padY;
  const points = [];
  for (let a = 3.5; a <= 3.5 + Math.PI * 2 + 0.55; a += 0.16) {
    const wobble = 1 + 0.035 * Math.sin(a * 3) + (a > 3.5 + Math.PI * 2 ? 0.07 : 0);
    points.push({ x: cx + Math.cos(a) * rx * wobble, y: cy + Math.sin(a) * ry * (1 + 0.04 * Math.cos(a * 2)) - (a - 3.5) * 1.1 });
  }
  return inkPath(points);
}
