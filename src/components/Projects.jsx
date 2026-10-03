import { useState } from "react";
import { ExternalLink, Github, Play, Trophy } from "lucide-react";
import { projects, categories } from "../data/profile.js";
import SectionHeading from "./SectionHeading.jsx";
import PreviewModal from "./PreviewModal.jsx";

function Links({ project, onPreview }) {
  const { live, code, preview, category } = project;
  if (!live && !code) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs uppercase tracking-widest">
      {preview && (
        <button type="button" onClick={() => onPreview(project)} className="inline-flex items-center gap-1.5 border border-ember px-2 py-1 uppercase tracking-widest text-ember hover:bg-ember hover:text-night">
          <Play size={12} aria-hidden="true" /> {category === "game" ? "Play here" : "Preview here"}
        </button>
      )}
      {live && (
        <a href={live} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-ember hover:text-gold">
          <ExternalLink size={13} aria-hidden="true" /> Live
        </a>
      )}
      {code && (
        <a href={code} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-mute hover:text-ink">
          <Github size={13} aria-hidden="true" /> Code
        </a>
      )}
    </div>
  );
}

function Tags({ tags }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((t) => (
        <span key={t} className="chip">{t}</span>
      ))}
    </div>
  );
}

export default function Projects() {
  const [cat, setCat] = useState("all");
  const [preview, setPreview] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const visible = projects.filter((p) => cat === "all" || p.category === cat);
  const featured = visible.filter((p) => p.featured);
  const rest = visible.filter((p) => !p.featured);

  return (
    <section id="projects" className="py-16">
      <SectionHeading index="02" title="Projects">
        Filter by type, or try the live ones right here.
      </SectionHeading>

      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Project type">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cat === c.id}
            onClick={() => setCat(c.id)}
            className={`btn !py-1.5 ${cat === c.id ? "btn-primary" : ""}`}
          >
            {c.label}
            <span className="opacity-60">{projects.filter((p) => c.id === "all" || p.category === c.id).length}</span>
          </button>
        ))}
      </div>

      {featured.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((p) => (
            <article key={p.title} className="panel panel-hover flex flex-col p-6">
              {p.award && (
                <p className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gold">
                  <Trophy size={13} aria-hidden="true" /> {p.award}
                </p>
              )}
              <h3 className="font-pixel text-2xl text-ink">{p.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/85">{p.description}</p>
              <div className="mt-auto">
                <Tags tags={p.tags} />
                <Links project={p} onPreview={setPreview} />
              </div>
            </article>
          ))}
        </div>
      )}

      {rest.length > 0 && !showAll && featured.length > 0 && (
        <button type="button" onClick={() => setShowAll(true)} className="btn mt-8">
          Show {rest.length} more projects
        </button>
      )}
      {rest.length > 0 && (showAll || featured.length === 0) && (
        <>
          <p className="label mb-4 mt-10">More projects</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <article key={p.title} className="panel panel-hover flex flex-col p-5">
                <h3 className="font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{p.description}</p>
                <div className="mt-auto">
                  <Tags tags={p.tags} />
                  <Links project={p} onPreview={setPreview} />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      {preview && <PreviewModal project={preview} onClose={() => setPreview(null)} />}
    </section>
  );
}
