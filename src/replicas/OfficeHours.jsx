import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { MATH_FONT, typeset } from "./officehours/math.js";
import { inkPath } from "./officehours/hand.js";
import { LESSONS, PAGE_INK } from "./officehours/lessons.js";
import { FADE_MS, STROKE_MS, buildSchedule, frameAt } from "./officehours/schedule.js";

/*
 * Better Office Hours, rebuilt from the real desk: VoiceSession.tsx and
 * session.css (the 62/38 desk + agent split), Orb.tsx/orb.css (four orb
 * states), Captions.tsx, Whiteboard.tsx/whiteboard.css (tutor notes vs your
 * ink, glyph-by-glyph writing, the ink bar), and PdfViewer/Overlay/Pointer
 * with workspace.css (the notes desk, marker sweep, tutor pointer).
 * The lessons, notes pages and student are invented.
 */

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (p) => 1 - Math.pow(1 - p, 3);

const SANS = '"Source Sans 3", Inter, system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const BLUE = "#3468c0";
const STUDENT_HEX = { blue: BLUE, ink: "#1c1917", rust: "#c45c26", gold: "#e0b15a" };
const SPEED = { cover: 1.25, full: 1 };

// orb.css and the caption entrance, scaled to em so the orb grows with the frame
const CSS = `
.boh-orb{position:relative;display:block;width:100%;height:100%;border:1px solid rgba(255,255,255,.08);border-radius:9999px;background:#20201f;box-shadow:0 1.1em 2.6em rgba(28,25,23,.18),inset 0 1px 1px rgba(255,255,255,.08);transform-origin:center;transition:transform .18s ease,background .25s ease,box-shadow .25s ease}
.boh-idle{animation:boh-breathe 3.6s ease-in-out infinite}
.boh-listening{background:#171716;box-shadow:0 0 0 .38em rgba(28,25,23,.07),0 1.1em 2.75em rgba(28,25,23,.22)}
.boh-thinking{background:#292927;animation:boh-think 1.8s ease-in-out infinite}
.boh-speaking{background:#111110;animation:boh-speak 1.05s ease-in-out infinite}
@keyframes boh-breathe{0%,100%{transform:scale(.985);box-shadow:0 1em 2.4em rgba(28,25,23,.16)}50%{transform:scale(1.02);box-shadow:0 1.3em 3em rgba(28,25,23,.22)}}
@keyframes boh-think{0%,100%{box-shadow:0 0 0 0 rgba(28,25,23,.08),0 1.1em 2.6em rgba(28,25,23,.18)}50%{box-shadow:0 0 0 .5em rgba(28,25,23,.06),0 1.3em 3em rgba(28,25,23,.24)}}
@keyframes boh-speak{0%,100%{transform:scale(.99);box-shadow:0 0 0 .3em rgba(28,25,23,.06),0 1.1em 2.6em rgba(28,25,23,.2)}50%{transform:scale(1.05);box-shadow:0 0 0 .7em rgba(28,25,23,.08),0 1.4em 3.25em rgba(28,25,23,.28)}}
@keyframes boh-cap{from{opacity:0;transform:translateY(.4em)}to{opacity:1;transform:none}}
.boh-cap{animation:boh-cap .35s ease both}
.boh-still *{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.boh-idle,.boh-thinking,.boh-speaking,.boh-cap{animation:none}}
`;

/* ---------- clock ---------- */

function reducer(s, a) {
  switch (a.type) {
    case "tick": {
      const S = a.scheds[s.li];
      const t = s.t + a.dt;
      if (t < S.total) return { ...s, t };
      if (a.cover) return { ...s, t: S.coverFrom };
      if (s.auto) return { ...s, li: (s.li + 1) % a.scheds.length, t: 0 };
      return s.t === S.total ? s : { ...s, t: S.total };
    }
    case "pick":
      return { li: a.li, t: a.t, auto: false, paused: false };
    case "seek":
      return { ...s, t: a.t, auto: false };
    case "pause":
      return { ...s, paused: a.paused, auto: false };
    default:
      return s;
  }
}

export default function OfficeHours({ mode = "cover", playing = true }) {
  const full = mode === "full";
  const scheds = useMemo(() => LESSONS.map(buildSchedule), []);
  const [still] = useState(reduced);
  const [s, dispatch] = useReducer(reducer, null, () => ({
    li: 0,
    t: still ? scheds[0].poster : scheds[0].coverFrom,
    auto: true,
    paused: false,
  }));
  const S = scheds[s.li];
  const f = frameAt(S, s.t);

  useEffect(() => {
    if (!playing || s.paused || still) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = Math.min(now - last, 120);
      last = now;
      dispatch({ type: "tick", dt: dt * SPEED[full ? "full" : "cover"], scheds, cover: !full });
    }, 33);
    return () => clearInterval(id);
  }, [playing, s.paused, still, full, scheds]);

  // The real desk jumps to the document when the tutor highlights it; the visitor can switch back
  const [override, setOverride] = useState(null);
  const scripted = f.notes ? "notes" : "board";
  const view = override && override.li === s.li && override.notes === f.notes ? override.view : scripted;

  // The visitor's own ink on the board (full mode), with undo and redo
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("blue");
  const [mine, setMine] = useState({ li: 0, strokes: [], future: [] });
  const myStrokes = mine.li === s.li ? mine.strokes : [];
  const myFuture = mine.li === s.li ? mine.future : [];

  const pick = (li) => {
    dispatch({ type: "pick", li, t: still ? scheds[li].poster : 0 });
    setOverride(null);
    setMine({ li, strokes: [], future: [] });
  };
  const seek = (t) => dispatch({ type: "seek", t: Math.max(0, Math.min(S.total, t)) });
  const tapOrb = () => dispatch({ type: "pause", paused: !s.paused });

  const orbState = s.paused ? "idle" : f.orb;
  const status = s.paused ? "Tap to start" : f.recording ? "Listening · tap when finished" : f.orb === "speaking" ? "Speaking" : f.orb === "thinking" ? "Thinking" : "Listening";
  const level = f.recording && !s.paused ? 1 + Math.min(0.22, (0.16 + 0.12 * Math.sin(s.t / 95) + 0.07 * Math.sin(s.t / 37)) * 0.45) : 1;

  const ink = {
    tool, color, setTool, setColor,
    strokes: myStrokes,
    canUndo: myStrokes.length > 0,
    canRedo: myFuture.length > 0,
    add: (stroke) => setMine({ li: s.li, strokes: [...myStrokes, stroke], future: [] }),
    erase: (ids) => setMine({ li: s.li, strokes: myStrokes.filter((x) => !ids.includes(x.id)), future: [] }),
    undo: () => myStrokes.length && setMine({ li: s.li, strokes: myStrokes.slice(0, -1), future: [myStrokes.at(-1), ...myFuture] }),
    redo: () => myFuture.length && setMine({ li: s.li, strokes: [...myStrokes, myFuture[0]], future: myFuture.slice(1) }),
  };

  return (
    <div className={`h-full w-full overflow-hidden [container-type:size] ${playing ? "" : "boh-still"}`} {...(full ? {} : { role: "img", "aria-label": "Better Office Hours tutor desk replica", inert: true })}>
      <style>{CSS}</style>
      <div
        className={`grid h-full w-full select-none bg-[#f4efe4] text-[#1c1917] antialiased ${full ? "grid-rows-[minmax(0,1fr)_auto]" : "grid-rows-[minmax(0,1fr)]"}`}
        style={{ fontSize: "2cqw", fontFamily: SANS }}
      >
        <div className="grid min-h-0 grid-cols-[62fr_38fr]">
          <Desk S={S} t={s.t} view={view} full={full} ink={ink} onView={(v) => setOverride({ view: v, li: s.li, notes: f.notes })} />

          <section className="relative z-[1] flex min-h-0 min-w-0 flex-col items-center overflow-hidden border-l border-[rgba(68,64,60,0.12)] bg-[#f4efe4] px-[0.85em] pb-[1em] pt-[1.5em] shadow-[-1.1em_0_2.75em_rgba(68,64,60,0.045)]">
            <div className="relative h-[4.5em] w-[4.5em] shrink-0">
              <Orb state={orbState} level={level} full={full} paused={s.paused} onTap={tapOrb} />
              {full ? (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "pause", paused: true })}
                  title="Pause voice (Escape)"
                  className="absolute left-[calc(100%+1.25em)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#d8d2c8] bg-[#fffcf6] px-[1.1em] py-[0.55em] text-[0.72em] text-[#6d675f] hover:bg-[#eae4d9]"
                  style={{ visibility: s.paused ? "hidden" : undefined }}
                >
                  <span aria-hidden="true">Ⅱ</span> Pause
                </button>
              ) : (
                <span className="absolute left-[calc(100%+1.25em)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#d8d2c8] bg-[#fffcf6] px-[1.1em] py-[0.55em] text-[0.72em] text-[#6d675f]">
                  Ⅱ Pause
                </span>
              )}
            </div>
            <p className="mt-[0.9em] shrink-0 text-[0.7em] tracking-[0.035em] text-[#78716c]">{status}</p>
            <Captions turns={f.turns} lesson={s.li} tight={view === "notes"} />
            {view === "notes" && <BoardPaper S={S} t={s.t} small full={full} ink={ink} onExpand={() => setOverride({ view: "board", li: s.li, notes: f.notes })} />}
          </section>
        </div>

        {full && (
          <DemoStrip
            scheds={scheds}
            s={s}
            f={f}
            onPick={pick}
            onSeek={seek}
            onReplay={() => pick(s.li)}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- orb ---------- */

function Orb({ state, level, full, paused, onTap }) {
  const orb = (
    <span
      aria-hidden="true"
      className={`boh-orb boh-${state}`}
      style={state === "listening" && level !== 1 ? { transform: `scale(${level.toFixed(3)})` } : undefined}
    />
  );
  if (!full) return <div className="h-full w-full rounded-full">{orb}</div>;
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={paused ? "Start the tutor" : "Interrupt the tutor"}
      title={paused ? "Tap to start" : "Tap to interrupt"}
      className="block h-full w-full cursor-pointer rounded-full border-0 bg-transparent p-0 outline-none transition-transform focus-visible:shadow-[0_0_0_4px_#f4efe4,0_0_0_6px_rgba(28,25,23,0.42)] active:scale-[0.96]"
    >
      {orb}
    </button>
  );
}

/* ---------- captions: live lines, the latest three stay dark ---------- */

function Captions({ turns, lesson, tight }) {
  const ref = useRef(null);
  const last = turns.at(-1)?.text;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    // Only fade the top edge once older lines are scrolled away
    const mask = el.scrollHeight > el.clientHeight + 2 ? "linear-gradient(to bottom, transparent, #000 1.4em)" : "";
    el.style.maskImage = mask;
    el.style.webkitMaskImage = mask;
  }, [turns.length, last, tight]);
  if (!turns.length) return <div className="min-h-0 w-full flex-1" />;
  return (
    <div className={`relative flex min-h-0 w-full flex-1 flex-col ${tight ? "mt-[0.6em] min-h-[4.5em]" : "mt-[1em]"}`}>
      <div className="flex shrink-0 justify-end">
        <span className="px-[0.5em] py-[0.25em] text-[0.62em] text-[#78716c]">Export</span>
      </div>
      <div ref={ref} className="flex min-h-0 flex-1 flex-col gap-[0.8em] overflow-hidden px-[0.35em] pb-[0.5em] pt-[0.2em]">
        {turns.map((turn, i) => (
          <p
            key={`${lesson}-${turn.at}`}
            className={`boh-cap m-0 shrink-0 text-[0.83em] leading-[1.5] transition-opacity ${turn.role === "tutor" ? "text-[#1c1917]" : "text-[#a8a29e]"}`}
            style={{ opacity: i < turns.length - 3 ? 0.42 : 1, textWrap: "pretty" }}
          >
            {turn.role === "student" && <span className="mb-[0.15em] block text-[0.72em] uppercase tracking-[0.09em] text-[#c4beb4]">You</span>}
            {turn.text}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ---------- the desk: Whiteboard or Notes ---------- */

function Desk({ S, t, view, full, ink, onView }) {
  const Tab = full ? "button" : "span";
  return (
    <section className="flex min-h-0 min-w-0 flex-col bg-[#e9e3d6] px-[1.25em] pb-[1.2em] pt-[1.05em]">
      <div className="mb-[0.75em] flex shrink-0 items-center gap-[1em]">
        <DeskButton>
          <span aria-hidden="true" className="text-[1.1em] leading-none">←</span> Leave
        </DeskButton>
        <div className="ml-auto flex gap-[2px] rounded-full border border-[#d8d0c3] p-[3px]" role="group" aria-label="Desk view">
          {[["board", "Whiteboard"], ["notes", "Notes"]].map(([v, label]) => (
            <Tab
              key={v}
              {...(full ? { type: "button", onClick: () => onView(v), "aria-pressed": view === v } : {})}
              className={`rounded-full px-[0.9em] py-[0.45em] text-[0.72em] ${view === v ? "bg-[#fffcf6] text-[#292621] shadow-[0_1px_3px_#30241812]" : "text-[#78716c]"} ${full ? "cursor-pointer" : ""}`}
            >
              {label}
            </Tab>
          ))}
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        {view === "board" ? <BoardPaper S={S} t={t} full={full} ink={ink} /> : <NotesDesk S={S} t={t} />}
      </div>
    </section>
  );
}

function DeskButton({ children }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-[0.35em] rounded-full border border-[rgba(48,36,24,0.14)] bg-[rgba(255,252,246,0.82)] px-[0.65em] py-[0.3em] text-[0.7em] font-medium text-[#44403c]">
      {children}
    </span>
  );
}

/* ---------- whiteboard ---------- */

function BoardPaper({ S, t, small = false, full, ink, onExpand }) {
  const [hover, setHover] = useState(null);
  const hint = ink.tool === "select" ? "Drag around your ink to select it" : ink.tool === "eraser" ? "Erase your ink, tutor notes stay in place" : "Your pen and highlighter marks stay editable";
  const focus = useMemo(() => {
    let y = 0;
    for (const [gid, start] of Object.entries(S.groupStart)) if (start <= t) y = Math.max(y, S.bottoms[gid]);
    for (const i of S.inks) if (i.start <= t) y = Math.max(y, i.bottom);
    return y;
  }, [S, t]);

  return (
    <div
      className={`flex w-full min-w-0 flex-col overflow-hidden border border-[#30241818] bg-[#fffcf6] shadow-[0_3px_16px_#30241805] ${small ? "mt-[0.6em] shrink-0 rounded-[14px]" : "absolute inset-0 rounded-[6px]"}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-[0.5em] px-[0.8em] pb-[0.3em] pt-[0.55em]">
        <div className="flex items-center gap-[0.85em] text-[0.68em] text-[#746f65]">
          <span className="inline-flex items-center gap-[0.35em]" onMouseEnter={() => setHover("tutor")} onMouseLeave={() => setHover(null)} title="Equations and diagrams written by the tutor">
            <span aria-hidden="true" className="text-[1.5em] leading-none text-[#292621]" style={{ fontFamily: MATH_FONT, fontStyle: "italic" }}>f</span> Tutor notes
          </span>
          <span className="inline-flex items-center gap-[0.35em] text-[#3468c0]" onMouseEnter={() => setHover("you")} onMouseLeave={() => setHover(null)} title="Your editable pen and highlighter marks">
            <svg viewBox="0 0 24 12" className="h-[0.9em] w-[1.7em]" aria-hidden="true"><path d="M1 7c3-5 5-5 7.5 0s4.5 5 7 0 4.5-5 7.5 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            Your ink
          </span>
        </div>
        {small && (
          <span
            {...(full ? { role: "button", tabIndex: 0, onClick: onExpand, onKeyDown: (e) => e.key === "Enter" && onExpand() } : {})}
            title="Expand whiteboard"
            className={`grid h-[1.8em] w-[1.8em] place-items-center rounded-[6px] text-[#746f65] ${full ? "cursor-pointer hover:bg-[#eee9df]" : ""}`}
          >
            <svg viewBox="0 0 24 24" className="h-[1.05em] w-[1.05em]" aria-hidden="true"><path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4M4 4l5 5m11-5-5 5M4 20l5-5m11 5-5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        )}
      </div>

      {small ? (
        // The rail board scrolls to the newest writing, like .board-scroll
        <div className="relative mx-[0.55em] h-[6.6em] shrink-0 overflow-hidden [container-type:size]" style={{ maskImage: "linear-gradient(to bottom, transparent, #000 1.1em)", WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 1.1em)" }}>
          <div className="absolute left-0 w-full transition-[top] duration-500 ease-out" style={{ height: "100cqw", top: `min(0px, calc(100cqh - ${((focus + 50) / 1000).toFixed(3)} * 100cqw))` }}>
            <Surface S={S} t={t} hover={hover} ink={ink} />
          </div>
        </div>
      ) : (
        <div className="relative mx-[0.55em] my-[0.2em] min-h-0 flex-1 [container-type:size]">
          <div className="absolute inset-0 m-auto" style={{ width: "min(100cqw, 100cqh)", height: "min(100cqw, 100cqh)" }}>
            <Surface S={S} t={t} hover={hover} ink={ink} drawable={full} />
          </div>
        </div>
      )}

      <div className={`flex shrink-0 items-center px-[0.85em] ${small ? "h-[1.5em]" : "h-[1.9em]"}`}>
        <span className="truncate text-[0.6em] text-[#928b7f]">{hint}</span>
      </div>
      <BoardInkBar ink={ink} full={full} small={small} />
    </div>
  );
}

function Surface({ S, t, hover, ink, drawable = false }) {
  const [draft, setDraft] = useState(null);
  const at = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 1000, y: ((e.clientY - r.top) / r.height) * 1000 };
  };
  const handlers = drawable
    ? {
        onPointerDown: (e) => {
          if (e.button !== 0 || ink.tool === "select") return;
          try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
          const p = at(e);
          if (ink.tool === "eraser") return eraseAt(p);
          setDraft({ tool: ink.tool, color: ink.color, points: [p] });
        },
        onPointerMove: (e) => {
          if (ink.tool === "eraser" && e.buttons === 1) return eraseAt(at(e));
          if (draft) setDraft({ ...draft, points: [...draft.points, at(e)] });
        },
        onPointerUp: () => {
          if (draft && draft.points.length) ink.add({ ...draft, id: `${Date.now()}-${draft.points.length}` });
          setDraft(null);
        },
        onPointerCancel: () => setDraft(null),
      }
    : {};
  function eraseAt(p) {
    const hit = ink.strokes.filter((st) => st.points.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 22)).map((st) => st.id);
    if (hit.length) ink.erase(hit);
  }

  return (
    <div
      className={`relative h-full w-full ${drawable ? (ink.tool === "eraser" ? "cursor-cell" : ink.tool === "select" ? "cursor-default" : "cursor-crosshair") : ""}`}
      style={{ backgroundImage: "radial-gradient(#b5ac9840 0.06em, transparent 0.06em)", backgroundSize: "1.15em 1.15em", touchAction: drawable ? "none" : undefined }}
      {...handlers}
    >
      <svg viewBox="0 0 1000 1000" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <g style={{ opacity: hover === "you" ? 0.2 : 1, transition: "opacity .15s" }}>
          {S.marks.map((m, i) => <Mark key={i} m={m} t={t} />)}
        </g>
        <g style={{ opacity: hover === "tutor" ? 0.2 : 1, transition: "opacity .15s" }}>
          {S.inks.map((k) => {
            const p = clamp((t - k.start) / k.dur);
            if (p <= 0) return null;
            return <path key={k.id} d={k.d} fill="none" stroke={BLUE} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" pathLength={p < 1 ? 1 : undefined} strokeDasharray={p < 1 ? 1 : undefined} strokeDashoffset={p < 1 ? 1 - p : undefined} />;
          })}
          {[...ink.strokes, ...(draft ? [draft] : [])].map((st, i) => (
            <path
              key={st.id ?? `draft-${i}`}
              d={inkPath(st.points)}
              fill="none"
              stroke={STUDENT_HEX[st.color]}
              strokeWidth={st.tool === "highlighter" ? 34 : 5.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={st.tool === "highlighter" ? { opacity: 0.42, mixBlendMode: "multiply" } : undefined}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

// One tutor mark: strokes draw in, writing appears glyph by glyph (whiteboard.css + reveal.ts)
function Mark({ m, t }) {
  const since = t - m.start;
  if (since < 0) return null;
  if (m.k === "path") {
    const p = clamp(since / STROKE_MS);
    const drawing = p < 1;
    return (
      <path
        d={m.d}
        fill="none"
        stroke={m.c}
        strokeWidth={m.w ?? 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={drawing ? 1 : undefined}
        strokeDasharray={drawing ? 1 : m.dashed ? "15 12" : undefined}
        strokeDashoffset={drawing ? 1 - ease(p) : undefined}
      />
    );
  }
  if (m.k === "fill") return <path d={m.d} fill={m.c} fillOpacity={(m.o ?? 1) * clamp(since / 300)} />;
  if (m.k === "head") return <path d={m.d} fill={m.c} opacity={clamp((since - 360) / 180)} />;
  if (m.k === "math") {
    return (
      <g transform={`translate(${m.left.toFixed(1)} ${m.y})`} style={{ fontFamily: MATH_FONT }}>
        {m.box.items.map((g, i) => {
          const o = clamp((since - m.delays[i]) / FADE_MS);
          if (o <= 0) return null;
          return g.rule ? (
            <rect key={i} x={g.x * m.s} y={g.y * m.s} width={g.w * m.s} height={Math.max(g.h * m.s, 2.6)} fill={g.c} opacity={o} />
          ) : (
            <text key={i} x={(g.x * m.s).toFixed(1)} y={(g.y * m.s).toFixed(1)} fontSize={(g.s * m.s).toFixed(1)} fontStyle={g.it ? "italic" : undefined} fill={g.c} opacity={o}>
              {g.ch}
            </text>
          );
        })}
      </g>
    );
  }
  // label: one tspan per glyph, laid out from the start so nothing reflows while it writes
  let n = 0;
  const glyphs = (text) =>
    [...text].map((ch) => {
      const o = clamp((since - (m.delays[n++] ?? 0)) / FADE_MS);
      return <tspan key={n} fillOpacity={o} strokeOpacity={o}>{ch}</tspan>;
    });
  return (
    <text
      x={m.x}
      y={m.y}
      fontSize={m.s}
      fill={m.c}
      textAnchor={m.anchor ?? "start"}
      stroke="#fffcf6"
      strokeWidth={m.s * 0.14}
      strokeLinejoin="round"
      paintOrder="stroke"
      style={{ fontFamily: SANS, fontWeight: 500, letterSpacing: "0.01em" }}
    >
      {m.runs
        ? m.runs.map((r, i) => {
            if (i) n++; // the space between runs in the delay list
            return <tspan key={i} x={r.x}>{glyphs(r.text)}</tspan>;
          })
        : glyphs(m.text)}
    </text>
  );
}

/* ---------- ink bars (Whiteboard BoardInkBar, PDF InkBar) ---------- */

const ICON = {
  select: <path d="m6 3 12 10-6 1-3 6z" />,
  pen: <path d="M14.5 5.5 18.5 9.5 9 19H5v-4zM13 7l4 4" />,
  highlighter: <path d="M6 18h12M8 15.5 15.5 8l2.5 2.5-7.5 7.5H8z" />,
  eraser: <path d="m7 15 6-6 5 5-4 4H8zM9.5 12.5l5 5" />,
  hand: <path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11m0-5.5V5a1.5 1.5 0 0 1 3 0v6m0-4.5a1.5 1.5 0 0 1 3 0V13a6 6 0 0 1-6 6h-.6a5 5 0 0 1-3.9-1.9L4.2 14.2a1.5 1.5 0 0 1 2.3-1.9L8 14" />,
  undo: <path d="M8 5 4 9l4 4M4 9h9a5 5 0 0 1 0 10h-2" />,
};
const Glyph = ({ name, flip }) => (
  <svg viewBox="0 0 24 24" className="h-[1.1em] w-[1.1em]" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {ICON[name]}
  </svg>
);

function BoardInkBar({ ink, full, small }) {
  const B = full ? "button" : "span";
  const size = small ? "h-[1.5em] w-[1.5em]" : "h-[1.75em] w-[1.75em]";
  const tool = (name, label) => (
    <B
      key={name}
      {...(full ? { type: "button", onClick: () => ink.setTool(name), "aria-pressed": ink.tool === name, title: label, "aria-label": label } : {})}
      className={`grid ${size} place-items-center rounded-[7px] ${ink.tool === name ? "bg-[#e8eef9] text-[#3468c0]" : "text-[#746f65]"} ${full && ink.tool !== name ? "hover:bg-[#eee9df] hover:text-[#292621]" : ""}`}
    >
      <Glyph name={name} />
    </B>
  );
  return (
    <div className={`flex w-full shrink-0 items-center justify-center border-t border-[#3024180d] px-[0.3em] ${small ? "flex-nowrap gap-[0.1em] py-[0.3em]" : "flex-wrap gap-[0.25em] py-[0.42em]"}`} role="toolbar" aria-label="Your board ink">
      <div className="flex items-center gap-[0.08em]">
        {tool("select", "Select and move your ink")}
        {tool("pen", "Pen")}
        {tool("highlighter", "Highlighter")}
        {tool("eraser", "Eraser")}
      </div>
      <div className="ml-[0.12em] flex items-center gap-[0.08em] border-l border-[#30241814] pl-[0.35em]">
        {Object.entries(STUDENT_HEX).map(([name, hex]) => (
          <B
            key={name}
            {...(full ? { type: "button", onClick: () => ink.setColor(name), "aria-label": `${name} ink`, "aria-pressed": ink.color === name } : {})}
            className="mx-[0.14em] h-[0.9em] w-[0.9em] rounded-full border-2 border-[#fffcf6]"
            style={{ background: hex, boxShadow: ink.color === name ? "0 0 0 1px #fffcf6, 0 0 0 2.5px #3468c0" : "0 0 0 1px #30241826" }}
          />
        ))}
      </div>
      <div className="ml-[0.12em] flex items-center gap-[0.08em] border-l border-[#30241814] pl-[0.35em]">
        {[["undo", ink.canUndo, ink.undo, false], ["redo", ink.canRedo, ink.redo, true]].map(([name, on, run, flip]) => (
          <B
            key={name}
            {...(full ? { type: "button", onClick: run, disabled: !on, "aria-label": `${name === "undo" ? "Undo" : "Redo"} your ink` } : {})}
            className={`grid ${size} place-items-center rounded-[7px] text-[#746f65] ${on ? (full ? "hover:bg-[#eee9df]" : "") : "opacity-30"}`}
          >
            <Glyph name="undo" flip={flip} />
          </B>
        ))}
      </div>
    </div>
  );
}

/* ---------- notes desk: the uploaded PDF with the tutor's highlight ---------- */

function NotesDesk({ S, t }) {
  const n = S.lesson.notes;
  const tool = (name, on) => (
    <span key={name} className={`grid h-[1.45em] w-[1.45em] place-items-center rounded-full ${on ? "bg-[#1c1917] text-[#fffcf6]" : "text-[#57534e]"}`}>
      <Glyph name={name} />
    </span>
  );
  const sep = "ml-[0.15em] flex items-center gap-[0.06em] border-l border-[rgba(48,36,24,0.1)] pl-[0.28em]";
  return (
    <div
      className="absolute inset-0 flex flex-col bg-[#e7e0d2] p-[0.9em]"
      style={{ backgroundImage: "radial-gradient(rgba(48,36,24,0.045) 0.7px, transparent 0.7px)", backgroundSize: "3px 3px" }}
    >
      <div className="flex shrink-0 items-center gap-[0.75em] px-[0.25em] pb-[0.5em]">
        <span className="min-w-0 flex-1 truncate text-[0.72em] tracking-[0.01em] text-[#78716c]">{n.file}</span>
        <DeskButton>Remove</DeskButton>
      </div>
      <div className="flex shrink-0 justify-center pb-[0.6em] pt-[0.1em]">
        <div className="flex items-center gap-[0.15em] rounded-full border border-[rgba(48,36,24,0.12)] bg-[rgba(255,252,246,0.94)] px-[0.25em] py-[0.18em] text-[0.92em] shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_6px_18px_rgba(48,36,24,0.08)]">
          <div className="flex items-center gap-[0.06em]">
            {tool("hand", true)}
            {tool("pen")}
            {tool("highlighter")}
            {tool("eraser")}
          </div>
          <div className={sep}>
            {["#1c1917", "#c45c26", "#e0b15a"].map((hex, i) => (
              <span key={hex} className="mx-[0.1em] h-[0.9em] w-[0.9em] rounded-full border-2 border-[rgba(255,252,246,0.9)]" style={{ background: hex, boxShadow: i === 0 ? "0 0 0 1px rgba(48,36,24,.18), 0 0 0 2px #fffcf6, 0 0 0 3.2px #1c1917" : "0 0 0 1px rgba(48,36,24,.18)" }} />
            ))}
          </div>
          <div className={`${sep} opacity-35`}>
            <span className="grid h-[1.45em] w-[1.45em] place-items-center text-[#57534e]"><Glyph name="undo" /></span>
            <span className="grid h-[1.45em] w-[1.45em] place-items-center text-[#57534e]"><Glyph name="undo" flip /></span>
          </div>
          <div className={`${sep} text-[#57534e]`}>
            <span className="grid h-[1.45em] w-[1.2em] place-items-center">−</span>
            <span className="min-w-[2.4em] text-center text-[0.68em] tabular-nums tracking-[0.02em]">100%</span>
            <span className="grid h-[1.45em] w-[1.2em] place-items-center">+</span>
          </div>
          <div className={`${sep} text-[#57534e]`}>
            <span className="grid h-[1.45em] w-[1.1em] place-items-center opacity-35">‹</span>
            <span className="min-w-[2.4em] text-center text-[0.68em] tabular-nums tracking-[0.02em]">1 / {n.pages}</span>
            <span className="grid h-[1.45em] w-[1.1em] place-items-center">›</span>
          </div>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden px-[0.6em] pt-[0.4em]">
        <div className="relative w-full bg-[#fffcf6] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_10px_28px_rgba(48,36,24,0.12)]">
          <NotesPage notes={n} since={t - S.notesAt} />
        </div>
      </div>
    </div>
  );
}

function pageBounds(el) {
  if (el.k === "math") {
    const box = typeset(el.tex, PAGE_INK);
    const left = el.anchor === "middle" ? el.x - (box.w * el.s) / 2 : el.x;
    return { left, right: left + box.w * el.s, top: el.y - box.asc * el.s, bottom: el.y + box.desc * el.s };
  }
  if (el.k === "box") return { left: el.x, right: el.x + el.w, top: el.y, bottom: el.y + el.h };
  return { left: el.x, right: el.x + 400, top: el.y - el.s, bottom: el.y + 3 };
}

// Overlay.tsx regionPath(): a hand-swept marker, slightly uneven at the edges
const REGION = [[1.4, 3.2], [22, 1.4, 48, 4.1, 72, 2.2], [86, 1.1, 96, 3.6, 98.6, 2.8], [98.8, 21.4], [78, 22.8, 54, 20.2, 32, 22.1], [16, 23.4, 6, 21.6, 1.6, 21.2]];

function NotesPage({ notes, since }) {
  const hl = useMemo(() => {
    const bs = notes.hl.els.map((i) => pageBounds(notes.els[i]));
    const [px, py] = notes.hl.pad;
    return { x: Math.min(...bs.map((b) => b.left)) - px, y: Math.min(...bs.map((b) => b.top)) - py, r: Math.max(...bs.map((b) => b.right)) + px, b: Math.max(...bs.map((b) => b.bottom)) + py };
  }, [notes]);
  const w = hl.r - hl.x, h = hl.b - hl.y;
  const P = (x, y) => `${(hl.x + (x / 100) * w).toFixed(1)},${(hl.y + (y / 24) * h).toFixed(1)}`;
  const region = `M${P(...REGION[0])} C${P(REGION[1][0], REGION[1][1])} ${P(REGION[1][2], REGION[1][3])} ${P(REGION[1][4], REGION[1][5])} C${P(REGION[2][0], REGION[2][1])} ${P(REGION[2][2], REGION[2][3])} ${P(REGION[2][4], REGION[2][5])} L${P(...REGION[3])} C${P(REGION[4][0], REGION[4][1])} ${P(REGION[4][2], REGION[4][3])} ${P(REGION[4][4], REGION[4][5])} C${P(REGION[5][0], REGION[5][1])} ${P(REGION[5][2], REGION[5][3])} ${P(REGION[5][4], REGION[5][5])} Z`;
  const sweep = clamp((since - 220) / 480);
  const reach = 1 - Math.exp(-Math.max(0, since - 120) / 110);
  const tip = { x: hl.r + 4 - (1 - reach) * 16, y: (hl.y + hl.b) / 2 + 2 };

  return (
    <svg viewBox="0 0 612 792" className="block h-auto w-full" aria-hidden="true">
      <rect width="612" height="792" fill="#fffcf6" />
      {notes.els.map((el, i) => <PageEl key={i} el={el} />)}
      {since >= 0 && sweep > 0 && (
        <path
          d={region}
          fill="rgba(247,197,96,0.3)"
          style={{ mixBlendMode: "multiply" }}
          opacity={0.4 + 0.6 * sweep}
          transform={`translate(${hl.x} 0) scale(${0.04 + 0.96 * ease(sweep)} 1) translate(${-hl.x} 0)`}
        />
      )}
      {since >= 120 && (
        <g transform={`translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) scale(1.15)`} opacity={clamp((since - 120) / 120)}>
          <path d="M 0 0 L 0 17 L 4.5 12.5 L 8 20 L 11.5 18.5 L 8 11 L 15 11 Z" fill="#292621" stroke="#fffcf6" strokeWidth="1.25" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}

function PageEl({ el }) {
  if (el.k === "rule") return <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#1c191733" strokeWidth="0.8" />;
  if (el.k === "box") return <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="2" fill={el.fill ?? "#faf6ee"} stroke="#1c191726" strokeWidth="0.8" />;
  if (el.k === "math") {
    const box = typeset(el.tex, PAGE_INK);
    const left = el.anchor === "middle" ? el.x - (box.w * el.s) / 2 : el.x;
    return (
      <g transform={`translate(${left.toFixed(1)} ${el.y})`} style={{ fontFamily: MATH_FONT }}>
        {box.items.map((g, i) =>
          g.rule ? (
            <rect key={i} x={g.x * el.s} y={g.y * el.s} width={g.w * el.s} height={Math.max(g.h * el.s, 0.8)} fill={PAGE_INK} />
          ) : (
            <text key={i} x={g.x * el.s} y={g.y * el.s} fontSize={g.s * el.s} fontStyle={g.it ? "italic" : undefined} fill={PAGE_INK}>{g.ch}</text>
          )
        )}
      </g>
    );
  }
  return (
    <text
      x={el.x}
      y={el.y}
      fontSize={el.s}
      fill={el.c ?? PAGE_INK}
      textAnchor={el.anchor ?? "start"}
      fontWeight={el.w}
      fontStyle={el.it ? "italic" : undefined}
      letterSpacing={el.ls}
      style={el.mono ? { fontFamily: MONO, whiteSpace: "pre", fontVariantLigatures: "none" } : { fontFamily: MATH_FONT }}
    >
      {el.spans ? el.spans.map((sp, i) => <tspan key={i} fontWeight={sp.w} fontStyle={sp.it ? "italic" : undefined}>{sp.t}</tspan>) : el.text}
    </text>
  );
}

/* ---------- demo controls (portfolio only, not part of the product) ---------- */

function DemoStrip({ scheds, s, f, onPick, onSeek, onReplay }) {
  const S = scheds[s.li];
  const track = useRef(null);
  const seekAt = (e) => {
    const r = track.current.getBoundingClientRect();
    onSeek(((e.clientX - r.left) / r.width) * S.total);
  };
  const step = (dir) => {
    const i = f.index;
    const into = s.t - S.beats[i].start;
    const to = dir < 0 ? (into > 500 || i === 0 ? i : i - 1) : Math.min(i + 1, S.beats.length - 1);
    onSeek(S.beats[to].start + 1);
  };
  const tone = { tutor: "#292621", student: "#3468c0", listen: "#3468c0", hold: "#b9b2a5" };
  const note = s.paused ? "Interrupted: speech and board frozen" : `${f.index + 1}/${S.beats.length} · ${f.beat.label}`;

  return (
    <div className="flex min-w-0 items-center gap-[0.9em] border-t border-[#d8d0c3] bg-[#ebe5d8] px-[1em] py-[0.5em] text-[0.56em] text-[#57534e]">
      <span className="shrink-0 uppercase tracking-[0.12em] text-[#938b7d]">Student asks</span>
      <div className="flex shrink-0 gap-[0.4em]">
        {scheds.map((x, i) => (
          <button
            key={x.lesson.id}
            type="button"
            title={x.lesson.ask}
            onClick={() => onPick(i)}
            className={`cursor-pointer rounded-full border px-[0.85em] py-[0.35em] ${i === s.li ? "border-[#292621] bg-[#292621] text-[#fffcf6]" : "border-[rgba(48,36,24,0.18)] bg-[#fffcf6] text-[#44403c] hover:border-[rgba(48,36,24,0.4)]"}`}
          >
            {x.lesson.chip}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => step(-1)} aria-label="Previous beat" className="shrink-0 cursor-pointer px-[0.3em] text-[1.3em] leading-none text-[#44403c] hover:text-[#1c1917]">‹</button>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label="Lesson beats"
        aria-valuemin={0}
        aria-valuemax={Math.round(S.total)}
        aria-valuenow={Math.round(s.t)}
        aria-valuetext={note}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); seekAt(e); }}
        onPointerMove={(e) => e.buttons === 1 && seekAt(e)}
        onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }}
        className="relative flex h-[1.5em] min-w-[8em] flex-1 cursor-pointer items-center gap-[2px] outline-none focus-visible:ring-2 focus-visible:ring-[#b95832]"
      >
        {S.beats.map((b, i) => (
          <span key={i} className="h-[0.5em] rounded-[2px]" style={{ flex: b.dur, background: tone[b.who], opacity: s.t >= b.end ? 0.85 : s.t >= b.start ? 0.6 : 0.18 }} />
        ))}
        <span className="pointer-events-none absolute top-1/2 h-[1.15em] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b95832]" style={{ left: `${(s.t / S.total) * 100}%` }} />
      </div>
      <button type="button" onClick={() => step(1)} aria-label="Next beat" className="shrink-0 cursor-pointer px-[0.3em] text-[1.3em] leading-none text-[#44403c] hover:text-[#1c1917]">›</button>
      <span className={`w-[21em] shrink-0 truncate ${s.paused ? "text-[#b95832]" : ""}`} title={note}>{note}</span>
      <button type="button" onClick={onReplay} className="flex shrink-0 cursor-pointer items-center gap-[0.35em] rounded-full border border-[rgba(48,36,24,0.18)] bg-[#fffcf6] px-[0.8em] py-[0.35em] text-[#44403c] hover:border-[rgba(48,36,24,0.4)]">
        <RotateCcw className="h-[1.1em] w-[1.1em]" aria-hidden="true" /> Replay
      </button>
    </div>
  );
}
