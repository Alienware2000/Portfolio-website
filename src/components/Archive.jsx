import { useState } from "react";
import { ExternalLink, Github, Play } from "lucide-react";
import { projects, categories } from "../data/profile.js";
import SectionHeading from "./SectionHeading.jsx";
import PreviewModal from "./PreviewModal.jsx";

// Everything without a case study (those already have a card in Selected work), newest first
const more = projects.filter((p) => !p.case).sort((a, b) => (b.year || 0) - (a.year || 0));
const SHOWN = 8;

/** The rest of what I've built: one line each, filterable, short until expanded */
export default function Archive() {
  const [cat, setCat] = useState("all");
  const [all, setAll] = useState(false);
  const [preview, setPreview] = useState(null);
  const matching = more.filter((p) => cat === "all" || p.category === cat);
  const rows = all ? matching : matching.slice(0, SHOWN);
  const counts = Object.fromEntries(categories.map((c) => [c.id, more.filter((p) => c.id === "all" || p.category === c.id).length]));

  return (
    <section id="projects" className="py-16">
      <SectionHeading id="projects" title="More projects">
        Hackathon builds, research, and tools, newest first.
      </SectionHeading>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        {categories
          .filter((c) => counts[c.id] > 0)
          .map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={cat === c.id}
              onClick={() => setCat(c.id)}
              className={`btn min-h-[40px] !py-1.5 ${cat === c.id ? "btn-primary" : ""}`}
            >
              {c.label}
              <span className="opacity-60">{counts[c.id]}</span>
            </button>
          ))}
      </div>

      <ul className="border-t border-line">
        {rows.map((p) => (
          <li key={p.title} className="grid items-baseline gap-x-6 gap-y-1 border-b border-line py-3.5 sm:grid-cols-[3rem_1fr_auto]">
            <p className="font-mono text-xs text-mute">{p.year}</p>
            <div className="min-w-0">
              <h3 className="inline font-semibold text-ink">{p.title}</h3>
              {p.award && <span className="ml-3 font-mono text-[11px] uppercase tracking-wider text-gold">{p.award.split(" · ")[0]}</span>}
              <p className="mt-0.5 text-sm leading-relaxed text-mute sm:truncate" title={p.description}>
                {p.description}
              </p>
            </div>
            <div className="flex items-center gap-1 text-mute sm:justify-end">
              {p.preview && (
                <button type="button" onClick={() => setPreview(p)} aria-label={`Try ${p.title} here`} title="Try it here" className="grid h-10 w-10 place-items-center hover:text-ember">
                  <Play size={15} aria-hidden="true" />
                </button>
              )}
              {p.live && (
                <a href={p.live} target="_blank" rel="noopener noreferrer" aria-label={`${p.title} live site`} title="Live site" className="grid h-10 w-10 place-items-center hover:text-ember">
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
              )}
              {p.code && (
                <a href={p.code} target="_blank" rel="noopener noreferrer" aria-label={`${p.title} code`} title="Code" className="grid h-10 w-10 place-items-center hover:text-ember">
                  <Github size={15} aria-hidden="true" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      {matching.length > SHOWN && (
        <button type="button" onClick={() => setAll((x) => !x)} className="btn mt-6 min-h-[40px]">
          {all ? "Show fewer" : `Show all ${matching.length}`}
        </button>
      )}
      {preview && <PreviewModal project={preview} onClose={() => setPreview(null)} />}
    </section>
  );
}
