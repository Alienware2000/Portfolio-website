import { useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { KNOBS, PRESETS, encode, write } from "./design.js";

/** Floating control panel that restyles the real site live. */
export default function LabPanel({ design, set, onReplayIntro }) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary fixed bottom-4 right-4 z-[60]">
        <FlaskConical size={14} aria-hidden="true" /> Lab
      </button>
    );
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(encode(design)); } catch { /* clipboard blocked */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const saveSlot = (name) => write(`design-${name}`, encode(design));

  return (
    <aside className="fixed bottom-4 right-4 z-[60] max-h-[85vh] w-[19rem] overflow-y-auto border-2 border-ember bg-night p-4 font-mono text-[11px] shadow-[6px_6px_0_rgba(0,0,0,0.6)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 uppercase tracking-widest text-ember">
          <FlaskConical size={14} aria-hidden="true" /> Design Lab
        </p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Minimize lab" className="text-mute hover:text-ink">
          <X size={16} />
        </button>
      </div>

      <p className="mb-1.5 uppercase tracking-widest text-mute">Presets</p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {Object.entries(PRESETS).map(([name, preset]) => (
          <button key={name} type="button" onClick={() => set(preset)} className={`border px-2 py-1 ${encode(preset) === encode(design) ? "border-ember bg-ember text-night" : "border-line text-ink hover:border-ember"}`}>
            {name}
          </button>
        ))}
      </div>

      {KNOBS.map((k) => (
        <div key={k.key} className="mb-3">
          <p className="mb-1.5 uppercase tracking-widest text-mute">{k.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {k.options.map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={design[k.key] === o}
                onClick={() => set({ [k.key]: o })}
                className={`border px-2 py-1 ${design[k.key] === o ? "border-ember bg-ember text-night" : "border-line text-ink hover:border-ember"}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-4 grid grid-cols-2 gap-1.5 border-t border-line pt-4">
        <button type="button" onClick={onReplayIntro} className="border border-line px-2 py-1.5 text-ink hover:border-ember">Replay intro</button>
        <button type="button" onClick={copy} className="border border-line px-2 py-1.5 text-ink hover:border-ember">{copied ? "Copied" : "Copy settings"}</button>
        <button type="button" onClick={() => saveSlot("a")} className="border border-line px-2 py-1.5 text-ink hover:border-ember">Save as A</button>
        <button type="button" onClick={() => saveSlot("b")} className="border border-line px-2 py-1.5 text-ink hover:border-ember">Save as B</button>
        <a href="/lab/compare" className="col-span-2 border border-ember px-2 py-1.5 text-center text-ember hover:bg-ember hover:text-night">Compare A vs B side by side</a>
      </div>
      <p className="mt-3 break-all text-mute">{encode(design)}</p>
    </aside>
  );
}
