/*
 * A tiny TeX-ish typesetter for the replica. The real board renders LaTeX with
 * MathJax into vector glyphs (lib/whiteboard/math-layout.ts); MathJax isn't on
 * this site, so this lays out the same small subset (fractions, scripts,
 * function names, operators) with a system math serif and per-glyph positions,
 * which is what lets the board write an equation in one glyph at a time.
 */

export const MATH_FONT = '"STIX Two Text", "STIX Two Math", "Cambria Math", "Times New Roman", Times, serif';
export const INK = "#292621";
export const MUTED = "#938b7d";
// lib/whiteboard/text.ts: a symbol keeps one color across lines, picked by code point
const SYMBOL_COLORS = ["#b95832", "#397b78", "#76649a"];

const FUNCS = new Set(["sin", "cos", "tan", "log", "ln"]);
const SYMBOLS = { Delta: "Δ", cdot: "·", to: "→", approx: "≈", times: "×", pi: "π", theta: "θ", le: "≤", ge: "≥", lfloor: "⌊", rfloor: "⌋" };
const SPACES = { ",": 0.17, ";": 0.28, quad: 1, qquad: 2 };
const REL = new Set(["=", "→", "≈", "<", ">", "≤", "≥"]);
const BIN = new Set(["+", "−", "·", "×"]);
const OPEN = new Set(["(", "⌊"]);

let ctx = null;
const widths = new Map();
function advance(ch, italic) {
  const key = (italic ? "i" : "r") + ch;
  if (widths.has(key)) return widths.get(key);
  if (!ctx && typeof document !== "undefined") ctx = document.createElement("canvas").getContext("2d");
  let w;
  if (ctx) {
    ctx.font = `${italic ? "italic " : ""}400 100px ${MATH_FONT}`;
    w = ctx.measureText(ch).width / 100;
  } else {
    w = /[(),.·⌊⌋]/.test(ch) ? 0.33 : /[=+−→<>≈]/.test(ch) ? 0.56 : /[ilt1]/.test(ch) ? 0.3 : /[mw]/.test(ch) ? 0.72 : 0.5;
  }
  widths.set(key, w);
  return w;
}

/* ---------- parse ---------- */

function parse(src) {
  let i = 0;
  const readBraced = () => {
    // raw text inside {...}
    if (src[i] !== "{") return "";
    let depth = 0, out = "";
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === "{") { if (depth++) out += c; continue; }
      if (c === "}") { if (--depth === 0) { i++; break; } out += c; continue; }
      out += c;
    }
    return out;
  };
  const command = () => {
    i++; // backslash
    if (/[,;!]/.test(src[i])) { const c = src[i++]; return { type: "space", w: SPACES[c] ?? 0 }; }
    let name = "";
    while (i < src.length && /[a-zA-Z]/.test(src[i])) name += src[i++];
    if (name === "frac") { const num = one(); const den = one(); return { type: "frac", num, den }; }
    if (name === "text") return { type: "text", s: readBraced() };
    if (FUNCS.has(name)) return { type: "fn", s: name };
    if (name in SPACES) return { type: "space", w: SPACES[name] };
    if (name in SYMBOLS) return { type: "atom", ch: SYMBOLS[name] };
    return { type: "text", s: name };
  };
  const one = () => {
    while (src[i] === " ") i++;
    if (src[i] === "{") { i++; return { type: "row", kids: group() }; }
    if (src[i] === "\\") return command();
    const ch = src[i++];
    return { type: "atom", ch: ch === "-" ? "−" : ch };
  };
  const group = () => {
    const out = [];
    while (i < src.length) {
      const c = src[i];
      if (c === "}") { i++; return out; }
      if (c === " ") { i++; continue; }
      if (c === "^" || c === "_") {
        i++;
        const arg = one();
        const key = c === "^" ? "sup" : "sub";
        const prev = out[out.length - 1];
        // x_0^2 stacks both scripts on the same base
        if (prev?.type === "script" && !prev[key]) { prev[key] = arg; continue; }
        const base = out.pop() ?? { type: "row", kids: [] };
        out.push({ type: "script", base, [key]: arg });
        continue;
      }
      out.push(one());
    }
    return out;
  };
  return { type: "row", kids: group() };
}

/* ---------- layout (em units, baseline at y = 0, y grows down) ---------- */

const colorOf = (ch, line) => {
  if (line !== INK) return line;
  if (/^[a-zA-Z]$/.test(ch) || /^[α-ωΑ-Ω]$/.test(ch)) return SYMBOL_COLORS[ch.codePointAt(0) % SYMBOL_COLORS.length];
  return line;
};
const ascentOf = (ch) => (/[a-z]/.test(ch) && !/[bdfhklt]/.test(ch) ? 0.46 : /[()⌊⌋]/.test(ch) ? 0.75 : 0.69);
const descentOf = (ch) => (/[gjpqyf]/.test(ch) ? 0.22 : /[()⌊⌋]/.test(ch) ? 0.25 : /,/.test(ch) ? 0.18 : 0.01);

function glyph(ch, italic, color, scale) {
  const w = advance(ch, italic) * scale;
  return { items: [{ ch, x: 0, y: 0, s: scale, it: italic, c: color, w }], w, asc: ascentOf(ch) * scale, desc: descentOf(ch) * scale, italic };
}

function shift(box, dx, dy) {
  return box.items.map((it) => ({ ...it, x: it.x + dx, y: it.y + dy }));
}

function layout(node, scale, color) {
  switch (node.type) {
    case "atom": {
      const ch = node.ch;
      const letter = /^[a-zA-Z]$/.test(ch) || /^[α-ω]$/.test(ch);
      const box = glyph(ch, letter, ch === "?" ? MUTED : colorOf(ch, color), scale);
      box.kind = REL.has(ch) ? "rel" : BIN.has(ch) ? "bin" : OPEN.has(ch) ? "open" : ch === "," ? "punct" : "ord";
      return box;
    }
    case "fn":
    case "text": {
      const items = [];
      let x = 0;
      for (const ch of node.s) {
        const w = advance(ch, false) * scale;
        if (ch !== " ") items.push({ ch, x, y: 0, s: scale, it: false, c: color, w });
        x += w;
      }
      return { items, w: x, asc: 0.69 * scale, desc: 0.01 * scale, kind: node.type === "fn" ? "fn" : "ord" };
    }
    case "space":
      return { items: [], w: node.w * scale, asc: 0, desc: 0, kind: "space" };
    case "script": {
      const base = layout(node.base, scale, color);
      const items = [...base.items];
      let w = base.w, asc = base.asc, desc = base.desc;
      const gap = (base.italic ? 0.06 : 0.02) * scale;
      if (node.sup) {
        const sup = layout(node.sup, scale * 0.7, color);
        const up = -0.42 * scale;
        items.push(...shift(sup, base.w + gap, up));
        w = Math.max(w, base.w + gap + sup.w);
        asc = Math.max(asc, sup.asc - up);
      }
      if (node.sub) {
        const sub = layout(node.sub, scale * 0.7, color);
        const down = 0.2 * scale;
        items.push(...shift(sub, base.w + 0.01 * scale, down));
        w = Math.max(w, base.w + 0.01 * scale + sub.w);
        desc = Math.max(desc, sub.desc + down);
      }
      return { items, w, asc, desc, kind: base.kind };
    }
    case "frac": {
      const s = scale * 0.92;
      const num = layout(node.num, s, color);
      const den = layout(node.den, s, color);
      const axis = 0.25 * scale, rule = 0.055 * scale, gap = 0.13 * scale, pad = 0.1 * scale;
      const w = Math.max(num.w, den.w) + pad * 2;
      const numY = -(axis + rule / 2 + gap + num.desc);
      const denY = -axis + rule / 2 + gap + den.asc;
      const items = [
        ...shift(num, (w - num.w) / 2, numY),
        { rule: true, x: 0, y: -axis - rule / 2, w, h: rule, c: color },
        ...shift(den, (w - den.w) / 2, denY),
      ];
      return { items, w, asc: num.asc - numY, desc: den.desc + denY, kind: "ord" };
    }
    default: {
      // row: place children with TeX-like spacing around relations and operators
      const boxes = node.kids.map((k) => layout(k, scale, color));
      const items = [];
      let x = 0, asc = 0, desc = 0, prev = null;
      boxes.forEach((b, idx) => {
        let kind = b.kind;
        if (kind === "bin" && (!prev || ["rel", "bin", "open", "punct"].includes(prev.kind))) kind = "ord"; // unary minus
        const space = kind === "rel" ? 0.28 : kind === "bin" ? 0.22 : 0;
        if (prev && space) x += space * scale;
        else if (prev?.kind === "fn" && kind !== "open") x += 0.17 * scale;
        else if (prev?.italic && !b.italic && kind === "open") x += 0.03 * scale;
        items.push(...shift(b, x, 0));
        x += b.w;
        if (space && idx < boxes.length - 1) x += space * scale;
        if (kind === "punct") x += 0.17 * scale;
        asc = Math.max(asc, b.asc);
        desc = Math.max(desc, b.desc);
        prev = { ...b, kind };
      });
      return { items, w: x, asc, desc, kind: "ord" };
    }
  }
}

const cache = new Map();
/** Typeset a TeX-ish string. Positions and sizes are in em; multiply by the font size. */
export function typeset(tex, color = INK) {
  const key = `${color}|${tex}`;
  if (!cache.has(key)) cache.set(key, layout(parse(tex), 1, color));
  return cache.get(key);
}

/** Bounding box (in font units already multiplied by size) of glyphs [from, to] of a formula. */
export function glyphBounds(box, size, from, to) {
  const picked = box.items.slice(from, to + 1);
  const left = Math.min(...picked.map((g) => g.x));
  const right = Math.max(...picked.map((g) => g.x + g.w));
  const top = Math.min(...picked.map((g) => (g.rule ? g.y : g.y - ascentOf(g.ch) * g.s)));
  const bottom = Math.max(...picked.map((g) => (g.rule ? g.y + g.h : g.y + descentOf(g.ch) * g.s)));
  return { left: left * size, right: right * size, top: top * size, bottom: bottom * size };
}
