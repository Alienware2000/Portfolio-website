import { useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Globe, Info, Minus, RotateCw, Square, Star, X } from "lucide-react";

// The sandbox desktop is 1280x800 (the agents' click coordinates are in this
// space), drawn once here and scaled down to fit the pane or a screenshot.
const W = 1280;
const H = 800;

/** A desktop frame scaled to `width` design pixels, like the stream or a captured screenshot. */
export function Screen({ desk, task, width, fill = false }) {
  const box = useRef(null);
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    if (!fill) return;
    const el = box.current;
    const fit = () => setH(el.clientHeight);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fill]);

  if (fill) {
    // Cover mode: fill the pane top to bottom and crop the sides, so there are no black bars
    const s = Math.max(width / W, h / H);
    return (
      <div ref={box} className="relative h-full overflow-hidden" style={{ width }}>
        <div className="absolute top-0" style={{ left: (width - W * s) / 2, width: W, height: H, transform: `scale(${s})`, transformOrigin: "0 0" }}>
          <Xfce desk={desk} task={task} />
        </div>
      </div>
    );
  }
  const s = width / W;
  return (
    <div className="relative overflow-hidden" style={{ width, height: H * s }}>
      <div className="absolute left-0 top-0" style={{ width: W, height: H, transform: `scale(${s})`, transformOrigin: "0 0" }}>
        <Xfce desk={desk} task={task} />
      </div>
    </div>
  );
}

function Xfce({ desk, task }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c0c0c] font-sans" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* Top panel */}
      <div className="absolute inset-x-0 top-0 z-10 flex h-7 items-center gap-3 bg-[#1d1d1d] px-2 text-[13px] text-[#dcdcdc]">
        <span className="flex items-center gap-1.5"><span className="text-[#3fa9f5]">✕</span>Applications</span>
        {desk.chrome && (
          <span className="flex h-6 items-center gap-1.5 rounded-sm bg-[#3a3a3a] px-2">
            <ChromeDot size={14} />
            {task.tab} - Google Chrome
          </span>
        )}
        <span className="ml-auto h-5 w-8 rounded-sm bg-[#2a5fa8]" />
        <span className="text-[#bdbdbd]">Mon 26 Oct, 14:05</span>
        <span>user</span>
      </div>
      {desk.chrome ? <Chrome desk={desk} task={task} /> : <Wallpaper />}
      {desk.cursor && <Cursor x={desk.cursor[0]} y={desk.cursor[1]} />}
    </div>
  );
}

function Wallpaper() {
  const icons = ["Trash", "File System", "Home"];
  return (
    <div className="absolute inset-0 top-7 bg-[radial-gradient(circle_at_50%_45%,#1e1e1e,#0b0b0b_60%)]">
      <div className="absolute left-5 top-5 flex flex-col gap-7">
        {icons.map((name) => (
          <div key={name} className="flex w-20 flex-col items-center gap-1.5 text-[13px] text-[#e5e5e5]">
            <span className={`h-11 w-10 rounded-md ${name === "Home" ? "bg-[#e8c36a]" : "bg-[#b9bec4]"}`} />
            {name}
          </div>
        ))}
      </div>
      <svg className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2" width="150" height="150" viewBox="-50 -50 100 100" aria-hidden="true">
        <polygon
          points={Array.from({ length: 16 }, (_, i) => {
            const r = i % 2 ? 22 : 44;
            const a = (Math.PI / 8) * i - Math.PI / 2;
            return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
          }).join(" ")}
          fill="none"
          stroke="#f4f1e6"
          strokeWidth="4"
          style={{ filter: "drop-shadow(0 0 6px rgba(255,250,220,0.8))" }}
        />
      </svg>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-md bg-[#1a1a1a] p-1.5">
        {["#7fb3d5", "#2d2d2d", "#9aa0a6", "#3b82c4", "#cfcfcf", "#e8c36a"].map((c) => (
          <span key={c} className="h-8 w-8 rounded" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

function Chrome({ desk, task }) {
  return (
    <div className="absolute inset-0 top-7 flex flex-col bg-white">
      <div className="flex h-9 shrink-0 items-end gap-2 bg-[#dee1e6] px-2">
        <div className="flex h-8 w-60 items-center gap-2 rounded-t-lg bg-white px-3 text-[13px] text-[#202124]">
          <Globe size={14} className="text-[#5f6368]" />
          <span className="flex-1 truncate">{task.tab}</span>
          <X size={14} className="text-[#5f6368]" />
        </div>
        <span className="mb-2 text-lg leading-none text-[#5f6368]">+</span>
        <div className="mb-2 ml-auto flex gap-5 text-[#3c4043]">
          <Minus size={14} />
          <Square size={12} />
          <X size={14} />
        </div>
      </div>
      <div className="flex h-9 shrink-0 items-center gap-3 border-b border-[#dadce0] px-3 text-[#5f6368]">
        <ArrowLeft size={16} />
        <ArrowRight size={16} className="opacity-40" />
        <RotateCw size={15} />
        <div className="flex h-7 flex-1 items-center gap-2 rounded-full bg-[#f1f3f4] px-3 text-[14px] text-[#202124]">
          <Info size={14} className="text-[#5f6368]" />
          {desk.url}
        </div>
        <Star size={15} />
      </div>
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-[#f3f4f6]" />
        {/* Zoomed around the viewport's top center; script.js maps click coordinates the same way. */}
        <div className="absolute left-0 top-0 h-[700px] w-[1280px]" style={{ transform: `scale(${task.zoom})`, transformOrigin: "640px 0" }}>
          {task.app === "todo" && <TodoApp s={desk.app} />}
          {task.app === "dice" && <DiceApp s={desk.app} />}
          {task.app === "tip" && <TipApp s={desk.app} />}
        </div>
      </div>
    </div>
  );
}

function ChromeDot({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#db4437" />
      <path d="M12 12 L22.5 7 A11 11 0 0 1 7 22 Z" fill="#0f9d58" />
      <path d="M12 12 L7 22 A11 11 0 0 1 1.5 7 Z" fill="#f4b400" />
      <circle cx="12" cy="12" r="5" fill="#4285f4" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

function Cursor({ x, y }) {
  return (
    <svg className="absolute z-20 transition-all duration-300 ease-out" style={{ left: x - 3, top: y - 2 }} width="26" height="30" viewBox="0 0 13 15" aria-hidden="true">
      <path d="M1 1 L1 12 L4 9.3 L6.2 14 L8.2 13 L6 8.6 L10 8.6 Z" fill="#111" stroke="#fff" strokeWidth="0.9" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Fake apps the builder "wrote" (plain HTML served by python3 http.server) ---------- */
// Positions line up with the click coordinates in script.js (viewport top is y=100).

function Page({ title, children }) {
  return (
    <div className="absolute inset-0 leading-6" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <div className="absolute left-[340px] top-6 w-[600px] rounded-xl bg-white px-10 pb-8 pt-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
        <h1 className="mb-5 h-10 text-center text-[34px] font-bold leading-10 text-[#1f2937]">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function TodoApp({ s }) {
  const left = s.todos.filter((t) => !t.done).length;
  return (
    <Page title="Todos">
      <div className="flex h-11 gap-2">
        <div className={`flex flex-1 items-center rounded-lg border-2 px-3 text-[20px] ${s.input ? "border-[#2563eb] text-[#111827]" : "border-[#d1d5db] text-[#9ca3af]"}`}>
          {s.input || "What needs doing?"}
          {s.input && <span className="ml-0.5 h-6 w-0.5 bg-[#111827]" />}
        </div>
        <div className="flex w-24 items-center justify-center rounded-lg bg-[#2563eb] text-[18px] font-semibold text-white">Add</div>
      </div>
      <ul className="mt-4">
        {s.todos.map((t) => (
          <li key={t.t} className="flex h-12 items-center gap-3 border-b border-[#e5e7eb] px-3 text-[20px]">
            <span className={`flex h-[18px] w-[18px] items-center justify-center rounded border-2 ${t.done ? "border-[#2563eb] bg-[#2563eb]" : "border-[#9ca3af]"}`}>
              {t.done && <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5 L5 9 L10 3" stroke="#fff" strokeWidth="2" fill="none" /></svg>}
            </span>
            <span className={`flex-1 ${t.done ? "text-[#9ca3af] line-through" : "text-[#111827]"}`}>{t.t}</span>
            <span className="text-[22px] text-[#9ca3af]">×</span>
          </li>
        ))}
        {s.todos.length === 0 && <li className="flex h-12 items-center justify-center text-[18px] italic text-[#9ca3af]">No todos yet.</li>}
      </ul>
      <p className="mt-3 text-[16px] text-[#6b7280]">{left} {left === 1 ? "item" : "items"} left</p>
    </Page>
  );
}

const PIPS = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
};

function Die({ face, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <rect x="3" y="3" width="94" height="94" rx="16" fill="#fff" stroke="#1f2937" strokeWidth="4" />
      {(PIPS[face] || []).map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="8.5" fill="#1f2937" />)}
    </svg>
  );
}

function DiceApp({ s }) {
  return (
    <Page title="Dice Roller">
      <div className="mx-auto flex h-[140px] w-[140px] items-center justify-center">
        {s.face ? <Die face={s.face} size={140} /> : <div className="h-[140px] w-[140px] rounded-[24px] border-4 border-dashed border-[#d1d5db]" />}
      </div>
      <p className="mt-1 h-6 text-center text-[17px] text-[#4b5563]">{s.face ? `You rolled ${s.face}` : "Click Roll to start"}</p>
      <div className="mx-auto mt-2 flex h-12 w-40 items-center justify-center rounded-lg bg-[#7c3aed] text-[20px] font-semibold text-white">Roll</div>
      <p className="mt-5 text-center text-[15px] font-semibold uppercase tracking-wider text-[#6b7280]">History</p>
      <div className="mt-2 flex min-h-12 justify-center gap-2.5">
        {s.history.map((h, i) => (
          // Index keys: values repeat and position is the meaning here.
          <span key={i} className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 text-[20px] font-semibold ${i === 0 ? "border-[#7c3aed] text-[#7c3aed]" : "border-[#e5e7eb] text-[#374151]"}`}>{h}</span>
        ))}
        {s.history.length === 0 && <span className="text-[16px] italic text-[#9ca3af]">No rolls yet</span>}
      </div>
    </Page>
  );
}

const money = (cents) => `$${(cents / 100).toFixed(2)}`;

function TipApp({ s }) {
  const bill = Math.round(Number(s.bill || 0) * 100);
  const tipC = Math.round((bill * s.pct) / 100);
  const total = bill + tipC;
  return (
    <Page title="Tip Calculator">
      <p className="text-[16px] font-semibold text-[#374151]">Bill</p>
      <div className={`mt-1.5 flex h-11 items-center rounded-lg border-2 px-3 text-[20px] ${s.bill ? "border-[#0d9488] text-[#111827]" : "border-[#d1d5db] text-[#9ca3af]"}`}>
        $ {s.bill || "0.00"}
      </div>
      <p className="mt-3 text-[16px] font-semibold text-[#374151]">Tip</p>
      <div className="mt-1.5 grid h-11 grid-cols-3 gap-2.5">
        {[15, 18, 20].map((p) => (
          <span key={p} className={`flex items-center justify-center rounded-lg text-[19px] font-semibold ${p === s.pct ? "bg-[#0d9488] text-white" : "bg-[#e5e7eb] text-[#374151]"}`}>{p}%</span>
        ))}
      </div>
      <p className="mt-3 text-[16px] font-semibold text-[#374151]">People</p>
      <div className="mt-1.5 flex h-11 items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e5e7eb] text-[22px] text-[#374151]">−</span>
        <span className="text-[22px] font-semibold text-[#111827]">{s.people}</span>
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e5e7eb] text-[22px] text-[#374151]">+</span>
      </div>
      <div className="mt-4 space-y-1.5 rounded-lg bg-[#f0fdfa] px-4 py-3 text-[19px] leading-7 text-[#134e4a]">
        <p className="flex justify-between"><span>Tip</span><span className="font-semibold">{money(tipC)}</span></p>
        <p className="flex justify-between"><span>Total</span><span className="font-semibold">{money(total)}</span></p>
        <p className="flex justify-between"><span>Each</span><span className="font-semibold">{money(Math.round(total / s.people))}</span></p>
      </div>
    </Page>
  );
}
