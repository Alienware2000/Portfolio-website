import { useCallback, useEffect, useState } from "react";

// Every knob the Design Lab exposes. First option of each is the default.
export const KNOBS = [
  { key: "hero", label: "Hero", options: ["split", "minimal", "card"] },
  { key: "bg", label: "Background", options: ["particles", "grid", "both", "plain"] },
  { key: "accent", label: "Accent", options: ["ember", "cyan", "lime", "violet", "gold"] },
  { key: "heading", label: "Headings", options: ["pixel", "sans", "mono"] },
  { key: "panel", label: "Panels", options: ["clean", "pixel", "soft"] },
  { key: "intro", label: "Intro", options: ["workspace", "terminal", "off"] },
  { key: "scan", label: "Scanlines", options: ["off", "on"] },
];

export const DEFAULTS = Object.fromEntries(KNOBS.map((k) => [k.key, k.options[0]]));

export const PRESETS = {
  Hybrid: DEFAULTS,
  Minimal: { ...DEFAULTS, hero: "minimal", heading: "sans" },
  Arcade: { ...DEFAULTS, hero: "card", bg: "grid", panel: "pixel", intro: "terminal", scan: "on" },
  Soft: { ...DEFAULTS, bg: "plain", heading: "sans", panel: "soft", accent: "violet" },
};

// "hero:split,bg:grid" <-> { hero: "split", bg: "grid" }; unknown values are dropped
export const encode = (d) => KNOBS.map((k) => `${k.key}:${d[k.key]}`).join(",");
export const decode = (str) => {
  const out = { ...DEFAULTS };
  for (const pair of (str || "").split(",")) {
    const [key, value] = pair.split(":");
    const knob = KNOBS.find((k) => k.key === key);
    if (knob && knob.options.includes(value)) out[key] = value;
  }
  return out;
};

const read = (name) => {
  try { return localStorage.getItem(name); } catch { return null; }
};
export const write = (name, value) => {
  try { localStorage.setItem(name, value); } catch { /* storage unavailable */ }
};

// The lab only exists when running locally (npm run dev) at /lab. None of it is
// reachable on the live site, and production ignores stored or URL settings.
const DEV = import.meta.env.DEV;
const params = new URLSearchParams(window.location.search);
const path = window.location.pathname.replace(/\/$/, "");
export const isEmbed = DEV && params.has("embed");
export const compareMode = DEV && path === "/lab/compare";
export const labEnabled = DEV && path === "/lab";

export const slot = (name) => decode(read(`design-${name}`) || encode(name === "b" ? PRESETS.Arcade : DEFAULTS));

export function useDesign() {
  const [design, setDesign] = useState(() => (DEV ? decode(params.get("d") || read("design") || "") : DEFAULTS));

  useEffect(() => {
    const root = document.documentElement;
    for (const k of ["accent", "heading", "panel"]) root.dataset[k] = design[k];
    if (DEV && !isEmbed) write("design", encode(design));
  }, [design]);

  const set = useCallback((patch) => setDesign((d) => ({ ...d, ...patch })), []);
  return [design, set];
}
