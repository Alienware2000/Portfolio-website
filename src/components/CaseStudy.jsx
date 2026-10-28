import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ExternalLink, Github, Link2, Lock, Play, Trophy } from "lucide-react";
import { profile } from "../data/profile.js";
import { navigate } from "../lib/route.js";
import { setOverlay } from "../lib/overlay.js";
import ArchDiagram from "./ArchDiagram.jsx";
import Media from "./Media.jsx";
import { useOnScreen } from "../lib/useOnScreen.js";

function Block({ title, wide, children }) {
  return (
    <section className={`grid gap-3 border-t border-line py-8 ${wide ? "" : "md:grid-cols-[180px_1fr] md:gap-10"}`}>
      <h3 className="label pt-1">{title}</h3>
      <div className="min-w-0 text-[15px] leading-relaxed text-ink/90">{children}</div>
    </section>
  );
}

function CopyLink() {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch { /* clipboard blocked */ }
  };
  return (
    <button type="button" onClick={copy} className="btn !px-3 !py-1.5">
      {done ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
      <span className="hidden sm:inline">{done ? "Copied" : "Copy link"}</span>
    </button>
  );
}

/** A muted clip that plays only while on screen, with a caption under it */
function Clip({ video, poster, caption }) {
  const ref = useRef(null);
  const onScreen = useOnScreen(ref);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (onScreen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => {});
    else v.pause();
  }, [onScreen]);
  return (
    <figure className="min-w-0">
      <video ref={ref} className="w-full border border-line bg-black" muted loop playsInline controls preload="metadata" poster={poster}>
        <source src={video} type="video/mp4" />
      </video>
      <figcaption className="mt-2 text-sm leading-relaxed text-mute">{caption}</figcaption>
    </figure>
  );
}

/** One project told as a story: problem, what I built, the hard part, results, how it fits together */
export default function CaseStudy({ project, prev, next, onClose }) {
  const [live, setLive] = useState(false);
  const scroller = useRef(null);
  const c = project.case;

  // Move focus into the dialog, and give it back to whatever opened it on close
  useEffect(() => {
    const opener = document.activeElement;
    scroller.current?.focus({ preventScroll: true });
    setOverlay(true);
    return () => {
      setOverlay(false);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const before = document.title;
    document.title = `${project.title} | David Antwi`;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.title = before;
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [project, onClose]);

  useEffect(() => {
    setLive(false);
    scroller.current?.scrollTo(0, 0);
  }, [project]);

  return (
    <div ref={scroller} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${project.title} case study`} className="case-sheet fixed inset-0 z-50 overflow-y-auto bg-night outline-none">
      <div className="sticky top-0 z-10 border-b border-line bg-night/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-3 sm:px-8">
          <button type="button" onClick={onClose} className="btn !px-3 !py-1.5">
            <ArrowLeft size={14} aria-hidden="true" /> <span className="whitespace-nowrap">All work</span>
          </button>
          <p className="mr-auto truncate font-mono text-xs text-mute">work / {project.slug}</p>
          <CopyLink />
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-5 pb-20 pt-10 sm:px-8">
        {project.award && (
          <p className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-gold">
            <Trophy size={14} aria-hidden="true" /> {project.award}
          </p>
        )}
        {project.metric && !project.award && (
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-mute">{project.metric}</p>
        )}
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{project.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/85">{c.oneLiner}</p>
        <p className="mt-4 font-mono text-xs text-mute">{c.scope}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <ExternalLink size={14} aria-hidden="true" /> Open live site
            </a>
          )}
          {project.code ? (
            <a href={project.code} target="_blank" rel="noopener noreferrer" className="btn">
              <Github size={14} aria-hidden="true" /> Code
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-mute">
              <Lock size={13} aria-hidden="true" /> Code private
            </span>
          )}
        </div>

        <div className="mt-10">
          {live ? (
            <div className="panel aspect-[16/10] overflow-hidden">
              <iframe src={project.live} title={`${project.title} live`} className="h-full w-full border-0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" allow="autoplay; fullscreen; gamepad" />
            </div>
          ) : (
            <div>
              <Media project={project} eager full />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl font-mono text-xs leading-relaxed text-mute">
                  {project.cover?.replica && (
                    <>
                      <span className="text-ink/80">Interactive replica of the real interface.</span> {project.cover.note} Click around.
                    </>
                  )}
                </p>
                {project.preview && (
                  <button type="button" onClick={() => setLive(true)} className="btn btn-primary">
                    <Play size={14} aria-hidden="true" /> {project.category === "game" ? "Play the real thing here" : "Load the live site here"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {c.results?.length > 0 && (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.results.map((r) => (
              <li key={r.label} className="border-l-2 border-ember pl-4">
                <p className="stat-value font-mono text-2xl font-semibold">{r.value}</p>
                <p className="mt-1 text-sm text-mute">{r.label}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12">
          <Block title="The problem">
            <p>{c.problem}</p>
          </Block>
          <Block title="What I built">
            <ul className="space-y-2.5">
              {c.built.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-ember" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Block>
          <Block title="The hard part">
            <p>{c.hardPart}</p>
          </Block>
          {c.media?.length > 0 && (
            <Block title="See it run" wide>
              <div className="grid gap-8">
                {c.media.map((m) => (
                  <Clip key={m.video} {...m} />
                ))}
              </div>
            </Block>
          )}
          {c.arch && (
            <Block title="How it fits together" wide>
              <ArchDiagram spec={c.arch} />
            </Block>
          )}
          {c.decisions?.length > 0 && (
            <Block title="Decisions">
              <ul className="space-y-2.5">
                {c.decisions.map((d) => (
                  <li key={d} className="flex gap-3">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 border border-ember" aria-hidden="true" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </Block>
          )}
          {c.next && (
            <Block title="What's next">
              <p>{c.next}</p>
            </Block>
          )}
          <Block title="Built with">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          </Block>
        </div>

        <nav className="mt-6 grid gap-4 border-t border-line pt-8 sm:grid-cols-2" aria-label="More case studies">
          {prev && (
            <button type="button" onClick={() => navigate(`/work/${prev.slug}`)} className="panel panel-hover p-4 text-left">
              <span className="label inline-flex items-center gap-2"><ArrowLeft size={12} aria-hidden="true" /> Previous</span>
              <span className="mt-1 block font-semibold text-ink">{prev.title}</span>
            </button>
          )}
          {next && (
            <button type="button" onClick={() => navigate(`/work/${next.slug}`)} className="panel panel-hover p-4 text-right sm:col-start-2">
              <span className="label inline-flex items-center gap-2">Next <ArrowRight size={12} aria-hidden="true" /></span>
              <span className="mt-1 block font-semibold text-ink">{next.title}</span>
            </button>
          )}
        </nav>
        <p className="mt-10 text-sm text-mute">
          Want the details? <a className="text-ember hover:text-gold" href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
      </article>
    </div>
  );
}
