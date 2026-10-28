import { useEffect, useState } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A step counter that ticks while the scene is on screen and loops after `length` steps.
 * It starts on `start` so the first thing anyone sees is a full frame, not an empty one.
 */
function useTicker(playing, length, ms = 650, start = length - 1) {
  const [t, setT] = useState(() => (reduced() ? length - 1 : start));
  useEffect(() => {
    if (!playing || reduced()) return;
    const id = setInterval(() => setT((x) => (x + 1) % length), ms);
    return () => clearInterval(id);
  }, [playing, length, ms]);
  return t;
}

/* Cloud Coding Agent: the builder works, a separate verifier checks the running app */
const BUILDER = [
  "$ task: add CSV export to the orders page",
  "> writing definition of done (4 checks)",
  "> editing app/orders/page.tsx",
  "> npm run build ......... ok",
  "> handing off to verifier",
];
const CHECKS = ["Export button visible", "File downloads", "Columns match table", "Empty state handled"];

function AgentScene({ playing }) {
  const t = useTicker(playing, 16);
  const lines = Math.min(t + 1, BUILDER.length);
  const checkAt = (i) => BUILDER.length + 1 + i * 2;
  return (
    <div className="grid h-full grid-cols-2 gap-px bg-line font-mono  leading-relaxed">
      <div className="bg-night p-4">
        <p className="label mb-3 !text-[0.8em]">Builder agent</p>
        {BUILDER.slice(0, lines).map((l, i) => (
          <p key={l} className={i === 0 ? "text-ink" : "text-mute"}>{l}</p>
        ))}
        {lines < BUILDER.length && <span className="blink text-ember">_</span>}
      </div>
      <div className="bg-night p-4">
        <p className="label mb-3 !text-[0.8em]">Verifier · fresh context · read-only</p>
        {CHECKS.map((c, i) => {
          const shown = t >= checkAt(i);
          const fail = i === 2 && t < checkAt(3) + 2;
          return (
            <p key={c} className={`flex gap-2 transition-opacity ${shown ? "opacity-100" : "opacity-0"}`}>
              <span className={fail ? "text-red-400" : "text-mint"}>{fail ? "✗" : "✓"}</span>
              <span className="text-ink/85">{c}</span>
            </p>
          );
        })}
        {t >= checkAt(3) + 2 && <p className="mt-3 text-gold">evidence: 4 screenshots, 0 self-graded</p>}
      </div>
    </div>
  );
}

/* Mars Rover: the mission state machine stepping through a run while the rover drives */
const STATES = ["IDLE", "NAVIGATE", "SEARCH", "APPROACH", "ARRIVED"];
const PATH = "M30,150 C80,140 90,70 150,80 S230,140 270,60";

function RoverScene({ playing }) {
  const t = useTicker(playing, 12, 700);
  const active = Math.min(Math.floor(t / 2), STATES.length - 1);
  return (
    <div className="grid h-full grid-rows-[auto_1fr] bg-night p-4 font-mono">
      <div className="flex flex-wrap items-center gap-1.5">
        {STATES.map((s, i) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`border px-2 py-1 transition-colors ${i === active ? "border-ember bg-ember/15 text-ember" : i < active ? "border-line text-ink/70" : "border-line text-mute/60"}`}>{s}</span>
            {i < STATES.length - 1 && <span className="text-mute/50">→</span>}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 300 190" className="mt-2 h-full w-full" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 32} y1="0" x2={i * 32} y2="190" stroke="#1c1c24" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 34} x2="300" y2={i * 34} stroke="#1c1c24" />
        ))}
        <path d={PATH} fill="none" stroke="#3a3a48" strokeDasharray="4 4" />
        <circle cx="270" cy="60" r="10" fill="none" stroke="#ffd166" strokeDasharray="3 3" />
        <text x="252" y="40" fill="#ffd166" fontSize="9">goal</text>
        <path d={PATH} fill="none" stroke="rgb(var(--ember))" strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - Math.min(t / 9, 1)} style={{ transition: "stroke-dashoffset 0.7s linear" }} />
        <text x="10" y="182" fill="#9aa1b0" fontSize="9">gazebo sim · nav2 · fused localization</text>
      </svg>
    </div>
  );
}

/* Better Office Hours: the tutor draws on the whiteboard while it talks, and asks instead of telling */
function BoardScene({ playing }) {
  const t = useTicker(playing, 10, 800);
  return (
    <div className="relative h-full bg-[#f6f4ee] p-4 text-[#1d1d22]">
      <svg viewBox="0 0 300 180" className="h-full w-full" aria-hidden="true">
        <line x1="20" y1="150" x2="280" y2="150" stroke="#1d1d22" strokeWidth="1.5" />
        <line x1="150" y1="170" x2="150" y2="15" stroke="#1d1d22" strokeWidth="1.5" />
        <path d="M60,30 Q150,250 240,30" fill="none" stroke="#e4572e" strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={t >= 1 ? 0 : 1} style={{ transition: "stroke-dashoffset 1.6s ease-out" }} />
        <text x="190" y="45" fontSize="14" fontFamily="Georgia, serif" fontStyle="italic" opacity={t >= 3 ? 1 : 0} style={{ transition: "opacity 0.4s" }}>y = ax² + c</text>
        <circle cx="150" cy="140" r="4" fill="#2e86de" opacity={t >= 4 ? 1 : 0} style={{ transition: "opacity 0.3s" }} />
      </svg>
      <div className={`absolute bottom-4 left-4 right-4 rounded-md bg-[#1d1d22] px-3 py-2 text-white transition-opacity duration-500 sm:right-auto sm:max-w-[70%] ${t >= 5 ? "opacity-100" : "opacity-0"}`}>
        <span className="mr-2 font-mono text-[0.8em] uppercase tracking-widest text-[#e4572e]">tutor</span>
        What happens to the curve if a gets bigger?
      </div>
    </div>
  );
}

/* BENMP: spreadsheet rows flowing through the validating import into regional hubs */
const ROWS = [
  ["Accra", "+233 24 *** ****", "ok"],
  ["Kumasi", "024 *** ****", "fixed"],
  ["Lagos", "+234 80 *** ****", "ok"],
  ["Nairobi", "+254 7** ******", "ok"],
  ["Lomé", "missing phone", "flag"],
  ["Abidjan", "+225 07 ** ** **", "ok"],
  ["Lilongwe", "0991 *** ***", "fixed"],
  ["Kampala", "+256 77* ******", "ok"],
];
const BADGE = { ok: ["text-mint", "valid"], fixed: ["text-gold", "phone normalized"], flag: ["text-red-400", "needs review"] };

function HubsScene({ playing }) {
  const t = useTicker(playing, ROWS.length + 4, 600);
  const shown = Math.min(t + 1, ROWS.length);
  return (
    <div className="flex h-full flex-col bg-night p-4 font-mono">
      <div className="flex items-center justify-between">
        <p className="label !text-[0.8em]">Import wizard · partners.xlsx</p>
        <p className="text-gold">{t >= ROWS.length ? "16,000+ partners · 30+ countries" : `row ${shown} of ${ROWS.length}`}</p>
      </div>
      <div className="mt-3 flex-1 divide-y divide-line border border-line">
        {ROWS.slice(0, shown).map(([hub, phone, s]) => (
          <div key={hub} className="grid grid-cols-[1fr_1.4fr_1fr] gap-2 px-3 py-1.5" style={{ animation: "row-in 0.25s both" }}>
            <span className="text-ink">{hub} hub</span>
            <span className="truncate text-mute">{phone}</span>
            <span className={`text-right ${BADGE[s][0]}`}>{BADGE[s][1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* YAIS: the ticket flow, and the guarantees each step keeps (no screens until launch) */
const FLOW = ["Verify email", "Pick ticket", "Pay", "QR pass", "Check in"];
const RULES = [
  "duplicate payment notice → same ticket, no second email",
  "buyer closes the tab → purchase recovered",
  "refund the gala → conference access kept",
  "scan retried after a lost response → original receipt",
];

function TicketsScene({ playing }) {
  const t = useTicker(playing, FLOW.length + RULES.length + 3, 800);
  const active = Math.min(t, FLOW.length - 1);
  return (
    <div className="flex h-full flex-col bg-night p-4 font-mono">
      <div className="flex flex-wrap items-center gap-1.5">
        {FLOW.map((s, i) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`border px-2 py-1 transition-colors ${i === active ? "border-ember bg-ember/15 text-ember" : i < active ? "border-line text-ink/70" : "border-line text-mute/60"}`}>{s}</span>
            {i < FLOW.length - 1 && <span className="text-mute/50">→</span>}
          </span>
        ))}
      </div>
      <ul className="mt-5 space-y-2">
        {RULES.map((r, i) => (
          <li key={r} className={`flex gap-2 transition-opacity duration-500 ${t >= FLOW.length - 1 + i ? "opacity-100" : "opacity-0"}`}>
            <span className="text-mint">✓</span>
            <span className="text-ink/85">{r}</span>
          </li>
        ))}
      </ul>
      <p className="mt-auto text-mute">built · in private testing · opens at launch</p>
    </div>
  );
}

const SCENES = { agent: AgentScene, rover: RoverScene, board: BoardScene, hubs: HubsScene, tickets: TicketsScene };

export default function Scene({ name, playing }) {
  const S = SCENES[name];
  if (!S) return null;
  // Text is sized in em off the frame width, so a scene reads the same in a small card or a big one
  return (
    <div className="h-full [container-type:size]">
      <div className="h-full" style={{ fontSize: "clamp(9px, 2.3cqw, 17px)" }}>
        <S playing={playing} />
      </div>
    </div>
  );
}
