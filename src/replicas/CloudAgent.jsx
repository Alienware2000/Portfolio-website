import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpIcon,
  ChevronLeft,
  ChevronRight,
  MessageCircleIcon,
  MessageSquarePlusIcon,
  MonitorIcon,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { Screen } from "./cloudagent/Desktop.jsx";
import { Message, Panel, PanelHeader } from "./cloudagent/Parts.jsx";
import { TASKS, defaultTurns, expandTurns, reduceBeats } from "./cloudagent/script.js";

/*
 * Cloud Coding Agent replica: chat pane + live sandbox desktop, as in the real
 * app (src/components/app.tsx). A turn plays the real route's phases: plan the
 * definition of done, build, verify with a fresh read-only agent, then the
 * evidence card. Checkboxes flip only when the card lands.
 */

// Fixed internal design sizes, scaled to the container with a transform.
const SIZES = { cover: [800, 500], full: [1152, 720] };
const BAR = 40; // full mode demo controls strip

const MS = {
  full: { draft: 1100, user: 700, phase: 600, planning: 1400, checklist: 1300, reasoning: 600, tool: 620, text: 1700, card: 2600 },
  cover: { user: 420, phase: 240, planning: 650, checklist: 750, reasoning: 250, tool: 230, text: 600, card: 1400 },
};
const HOLD = { full: 5000, cover: 2600 };

const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const openKeys = (beats, upto = beats.length - 1) =>
  Object.fromEntries(beats.slice(0, upto + 1).filter((b) => b.open).map((b) => [`${b.ti}:${b.open}`, true]));

// Decorative older chats so the sidebar reads as the real "fleet" of status dots.
const OLDER = [
  { title: "Markdown notes with a live preview", verdict: "partial" },
  { title: "Pomodoro timer with a break chime", verdict: "verified" },
  { title: "Weather lookup for a city", verdict: "unable_to_verify" },
];

export default function CloudAgent({ mode = "cover", playing = true }) {
  const full = mode === "full";
  const kind = full ? "full" : "cover";
  const [DW, DH] = SIZES[kind];
  const [reduced] = useState(prefersReduced);

  const [taskIdx, setTaskIdx] = useState(0);
  const [turns, setTurns] = useState(() => defaultTurns(TASKS[0]));
  const task = TASKS[taskIdx];
  const beats = useMemo(() => expandTurns(task, turns, !full), [task, turns, full]);
  // Start on the finished turn so the first frame is complete, then loop from the top.
  const [step, setStep] = useState(() => expandTurns(TASKS[0], defaultTurns(TASKS[0]), !full).length - 1);
  const [open, setOpen] = useState(() => openKeys(expandTurns(TASKS[0], defaultTurns(TASKS[0]), !full)));
  const [auto, setAuto] = useState(true); // scripted autoplay until the visitor interacts
  const [streaming, setStreaming] = useState(false); // manual mode: a turn is playing out
  const [intro, setIntro] = useState(true);

  const view = useMemo(() => reduceBeats(task, beats, step), [task, beats, step]);
  const beat = beats[Math.min(step, beats.length - 1)];
  const atEnd = step >= beats.length - 1;

  // Fit the design canvas into the 16:10 box.
  const rootRef = useRef(null);
  const [box, setBox] = useState({ w: DW, h: DH });
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = Math.min(box.w / DW, box.h / DH) || 1;

  // The scripted clock. Each beat stays on screen for its duration, then the next one lands.
  useEffect(() => {
    if (!playing || reduced) return;
    if (!auto && (!streaming || beat.end)) return;
    const table = MS[kind];
    if (atEnd && auto) {
      const id = setTimeout(() => {
        setOpen({});
        setStep(0);
        if (!full) return;
        if (intro) setIntro(false);
        else {
          const next = (taskIdx + 1) % TASKS.length;
          setTaskIdx(next);
          setTurns(defaultTurns(TASKS[next]));
        }
      }, HOLD[kind]);
      return () => clearTimeout(id);
    }
    if (atEnd) return;
    const ms = beat.k === "phase" && beat.phase === "planning" ? table.planning : table[beat.k] ?? 600;
    const id = setTimeout(() => {
      const nb = beats[step + 1];
      if (auto && nb?.open) setOpen((o) => ({ ...o, [`${nb.ti}:${nb.open}`]: true }));
      setStep(step + 1);
    }, ms);
    return () => clearTimeout(id);
  }, [playing, reduced, auto, streaming, beat, atEnd, step, beats, kind, full, intro, taskIdx]);

  // Keep the newest part in view, like the real MessageScroller.
  const scrollRef = useRef(null);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [step, taskIdx, turns]);

  /* ---------- visitor controls (full mode) ---------- */
  const takeOver = () => {
    if (auto) setAuto(false);
  };
  // A card button sends "/fix" or "/verify": a new turn appended after the current one.
  const send = (turn) => {
    takeOver();
    setTurns([...turns.slice(0, beat.ti + 1), turn]);
    setStep(step + 1);
    setStreaming(true);
  };
  const canFix = !view.busy && view.lastVerdict !== "verified" && !!task.results.r2;
  const next = () => {
    takeOver();
    setStreaming(false);
    if (!atEnd) setStep(step + 1);
    else if (canFix) send("fix");
  };
  const prev = () => {
    takeOver();
    setStreaming(false);
    setStep(Math.max(0, step - 1));
  };
  const pick = (i) => {
    takeOver();
    setTaskIdx(i);
    setTurns(["main"]);
    setStep(0);
    setOpen({});
    setStreaming(true);
  };
  const replay = () => {
    setAuto(true);
    setIntro(false);
    setTurns(defaultTurns(task));
    setStep(0);
    setOpen({});
  };
  const togglePlay = () => {
    takeOver();
    if (running) setStreaming(false);
    else if (beat.end && canFix) send("fix");
    else setStreaming(true);
  };
  const toggleRow = (key) => {
    if (full) takeOver();
    setOpen((o) => ({ ...o, [key]: !o[key] }));
  };
  const running = !reduced && (auto || (streaming && !beat.end && !atEnd));
  // Card buttons are live whenever no turn is streaming; on the cover they are just pictures.
  const idle = !view.busy;
  const noop = () => {};

  const segs = [...new Set(beats.map((b) => b.seg))];
  const chatStatus = view.status;
  const chatWidth = full ? 360 : 322;
  const deskWidth = full ? DW - 16 - 16 - 240 - chatWidth - 2 : DW - 16 - 8 - chatWidth - 2;

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-white">
      <style>{`
        .ca-shimmer{background:linear-gradient(90deg,#737373 0%,#737373 40%,#d4d4d4 50%,#737373 60%,#737373 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ca-shimmer 2.2s linear infinite}
        @keyframes ca-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
        @media (prefers-reduced-motion: reduce){.ca-shimmer{animation:none;color:#737373;background:none}}
      `}</style>
      <div
        className="absolute left-1/2 top-1/2 flex flex-col bg-white font-sans text-[#0a0a0a] antialiased"
        style={{ width: DW, height: DH, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <div className="flex min-h-0 flex-1 gap-2 p-2">
          {full && (
            <Sidebar
              task={task}
              verdict={view.busy ? "running" : view.lastVerdict}
              onPick={pick}
              onNew={() => pick(taskIdx)}
            />
          )}

          {/* Chat pane (chat-pane.tsx) */}
          <Panel className="shrink-0" style={{ width: chatWidth }}>
            <PanelHeader>
              <MessageCircleIcon className="size-3.5" />
              Chat
              <span className="ml-auto font-normal normal-case opacity-50">[{chatStatus}]</span>
            </PanelHeader>
            <div ref={scrollRef} className={`min-h-0 flex-1 ${full ? "overflow-y-auto" : "overflow-hidden"} [scrollbar-width:thin] [scrollbar-color:#d4d4d4_transparent]`}>
              <div className="flex flex-col gap-5 p-3">
                {view.messages.map((msg, mi) => (
                  <Message
                    // Messages are append-only within a turn list.
                    key={`${taskIdx}-${mi}`}
                    msg={msg}
                    mi={mi}
                    live={view.busy && mi === view.messages.length - 1}
                    task={task}
                    open={open}
                    onToggle={toggleRow}
                    onFix={idle ? (full ? () => send("fix") : noop) : undefined}
                    onRetry={idle ? (full ? () => send("retry") : noop) : undefined}
                  />
                ))}
                {chatStatus === "submitted" && <div className="ca-shimmer font-mono text-xs">Working…</div>}
              </div>
            </div>
            <div className="border-t border-[#e5e5e5] p-2">
              <div className="flex h-8 items-center rounded-[10px] border border-[#e5e5e5] pl-2.5 pr-1">
                <span className={`flex-1 truncate text-sm ${view.draft ? "" : "text-[#737373]"}`}>{view.draft || "Tell the agent what to build…"}</span>
                <span className={`flex size-6 items-center justify-center rounded-[8px] bg-[#171717] text-white ${view.draft ? "" : "opacity-50"}`}>
                  <ArrowUpIcon className="size-4" />
                </span>
              </div>
            </div>
          </Panel>

          {/* Desktop pane (desktop-pane.tsx): the sandbox's live stream */}
          <Panel className="min-w-0 flex-1">
            <PanelHeader>
              <MonitorIcon className="size-3.5" />
              Desktop
              <span className="ml-auto font-normal normal-case opacity-50">live</span>
            </PanelHeader>
            <div className={`flex min-h-0 flex-1 justify-center bg-black ${full ? "items-center" : "items-stretch"}`}>
              <Screen desk={view.desk} task={task} width={deskWidth} fill={!full} />
            </div>
          </Panel>
        </div>

        {full && (
          <DemoBar
            task={task}
            segs={segs}
            seg={beat.seg}
            beats={beats}
            running={running}
            canPrev={step > 0}
            canNext={!atEnd || canFix}
            onPick={pick}
            onSeg={(s) => {
              takeOver();
              setStreaming(false);
              setStep(beats.findIndex((b) => b.seg === s));
            }}
            onPrev={prev}
            onNext={next}
            onPlay={togglePlay}
            onReplay={replay}
          />
        )}
      </div>
    </div>
  );
}

/* Sidebar (sidebar.tsx): the fleet view, one status dot per chat. */
const DOT = {
  running: "animate-pulse bg-[#2b7fff]",
  verified: "bg-[#00a63e]",
  partial: "bg-[#fe9a00]",
  failed: "bg-[#e7000b]",
  unable_to_verify: "bg-[#737373]/50",
};

function Sidebar({ task, verdict, onPick, onNew }) {
  const row = "flex h-7 w-full items-center justify-start gap-1 rounded-[8px] px-2.5 pr-7 text-[0.8rem]";
  return (
    <Panel className="w-60 shrink-0">
      <PanelHeader>Chats</PanelHeader>
      <div className="p-2">
        <button type="button" onClick={onNew} className="flex h-7 w-full items-center justify-center gap-1 rounded-[8px] border border-[#e5e5e5] bg-white text-[0.8rem] font-medium hover:bg-[#f5f5f5]">
          <MessageSquarePlusIcon className="size-3.5" />
          New chat
        </button>
      </div>
      <ul className="flex flex-1 flex-col gap-0.5 overflow-hidden px-2">
        {TASKS.map((t, i) => {
          const v = t === task ? verdict : "verified";
          return (
            <li key={t.id}>
              <button type="button" onClick={() => onPick(i)} className={`${row} ${t === task ? "bg-[#f5f5f5] text-[#171717]" : "hover:bg-[#f5f5f5]"}`}>
                {v && <span className={`mr-1 size-2 shrink-0 rounded-full ${DOT[v]}`} />}
                <span className="truncate">{t.request}</span>
              </button>
            </li>
          );
        })}
        {OLDER.map((c) => (
          <li key={c.title} className={row}>
            <span className={`mr-1 size-2 shrink-0 rounded-full ${DOT[c.verdict]}`} />
            <span className="truncate">{c.title}</span>
          </li>
        ))}
      </ul>
      <div className="h-px bg-[#e5e5e5]" />
      <div className="flex items-center justify-between gap-2 p-2">
        <span className="truncate text-xs text-[#737373]">dev@example.com</span>
        <span className="px-2.5 text-xs font-medium">Sign out</span>
      </div>
    </Panel>
  );
}

/* Portfolio-side controls for the case study; deliberately not part of the product's UI. */
function DemoBar({ task, segs, seg, running, canPrev, canNext, onPick, onSeg, onPrev, onNext, onPlay, onReplay }) {
  const chip = "border px-2 py-1 transition-colors";
  return (
    <div className="flex shrink-0 items-center gap-3 border-t border-[#2a2a34] bg-[#0a0a0c] px-3 font-mono text-[11px] text-[#9aa1b0]" style={{ height: BAR }}>
      <span className="uppercase tracking-[0.18em] text-[rgb(var(--ember))]">Demo</span>
      <div className="flex gap-1">
        {TASKS.map((t, i) => (
          <button key={t.id} type="button" onClick={() => onPick(i)} className={`${chip} ${t === task ? "border-[rgb(var(--ember))] text-[#f1f3f7]" : "border-[#2a2a34] hover:text-[#f1f3f7]"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <span className="h-4 w-px bg-[#2a2a34]" />
      <div className="flex min-w-0 items-center gap-1">
        {segs.map((s, i) => (
          <button key={s} type="button" onClick={() => onSeg(s)} className={`${chip} border-transparent ${s === seg ? "bg-[#19191f] text-[#ffd166]" : "hover:text-[#f1f3f7]"}`}>
            {i + 1}. {s}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button type="button" onClick={onPrev} disabled={!canPrev} aria-label="Previous step" className={`${chip} border-[#2a2a34] text-[#f1f3f7] hover:border-[rgb(var(--ember))] disabled:opacity-40`}>
          <ChevronLeft size={13} />
        </button>
        <button type="button" onClick={onPlay} aria-label={running ? "Pause" : "Play"} className={`${chip} border-[#2a2a34] text-[#f1f3f7] hover:border-[rgb(var(--ember))]`}>
          {running ? <Pause size={13} /> : <Play size={13} />}
        </button>
        <button type="button" onClick={onNext} disabled={!canNext} aria-label="Next step" className={`${chip} border-[#2a2a34] text-[#f1f3f7] hover:border-[rgb(var(--ember))] disabled:opacity-40`}>
          <ChevronRight size={13} />
        </button>
        <button type="button" onClick={onReplay} className={`${chip} ml-1 flex items-center gap-1 border-[#2a2a34] hover:text-[#f1f3f7]`}>
          <RotateCcw size={12} /> Replay
        </button>
      </div>
    </div>
  );
}
