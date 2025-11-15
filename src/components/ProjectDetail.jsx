import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { projects } from "../data/projects";
import { projectDetails } from "../data/projectDetails";

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);
  const isExoSense = slug === "exosense";
  const reduceMotion = useReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0.5); // 0..1
  const rafRef = useRef(0);

  // Lightweight scroll listener (no animation loop), disabled for reduced motion
  useEffect(() => {
    if (!isExoSense || reduceMotion) return;
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max =
          (doc.scrollHeight || 1) - (window.innerHeight || doc.clientHeight || 1);
        const y = window.scrollY || window.pageYOffset || 0;
        setScrollProgress(max > 0 ? y / max : 0);
        rafRef.current = 0;
      });
    };
    onScroll(); // set once
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [isExoSense, reduceMotion]);

  if (!project) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Project not found
        </h1>
        <p className="mb-8 text-slate-600 dark:text-slate-400">
          The project you’re looking for doesn’t exist or its page hasn’t been created yet.
        </p>
        <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-16">
      {/* Very faint glow accents (disabled on mobile / reduced motion) */}
      {isExoSense && !reduceMotion && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -z-10 hidden sm:block"
            style={{
              top: "30%",
              left: "-6rem",
              width: "18rem",
              height: "18rem",
              opacity: 0.08,
              filter: "blur(48px)",
              background:
                "radial-gradient(closest-side, rgba(34,211,238,0.6), rgba(34,211,238,0))",
              transform: `translateY(${(scrollProgress - 0.5) * 16}px)`,
              willChange: "transform",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -z-10 hidden sm:block"
            style={{
              bottom: "18%",
              right: "-5rem",
              width: "16rem",
              height: "16rem",
              opacity: 0.06,
              filter: "blur(56px)",
              background:
                "radial-gradient(closest-side, rgba(129,140,248,0.5), rgba(129,140,248,0))",
              transform: `translateY(${(0.5 - scrollProgress) * 14}px)`,
              willChange: "transform",
            }}
          />
        </>
      )}
      {/* Hero */}
      <header className="relative mb-12">
        <h1 className="mb-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {project.title}
        </h1>
        {(project.status || project.started) && (
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] ${
                project.status && String(project.status).toLowerCase() === "complete"
                  ? "border-emerald-500/30 bg-emerald-400/10 text-emerald-300"
                  : project.status && String(project.status).toLowerCase() === "in progress"
                  ? "border-amber-400/30 bg-amber-300/10 text-amber-300"
                  : "border-white/10 bg-white/5 text-slate-600 dark:text-slate-300"
              }`}
            >
              {project.status ? project.status : null}{project.status && project.started ? " · " : ""}{project.started ? project.started : null}
            </span>
          </div>
        )}
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          {project.description}
        </p>
        {/* Subtle quaternion axis glyph watermark (ExoSense only) */}
        {isExoSense && (
          <svg
            aria-hidden="true"
            className="hidden sm:block absolute -z-10 top-1/2 right-0 h-40 w-40 -translate-y-1/2 opacity-[0.06] text-cyan-300/80 dark:text-cyan-200/80"
            viewBox="0 0 120 120"
            style={{
              transform: reduceMotion
                ? "translateY(-50%)"
                : `translateY(-50%) rotate(${(scrollProgress - 0.5) * 12}deg) translateY(${(scrollProgress - 0.5) * 6
                  }px)`,
              transformOrigin: "50% 50%",
              willChange: "transform",
            }}
          >
            {/* Axis rings */}
            <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <ellipse cx="60" cy="60" rx="50" ry="18" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <ellipse cx="60" cy="60" rx="18" ry="50" fill="none" stroke="currentColor" strokeWidth="0.6" />
            {/* Axis ticks */}
            <line x1="60" y1="10" x2="60" y2="20" stroke="currentColor" strokeWidth="1" />
            <line x1="60" y1="100" x2="60" y2="110" stroke="currentColor" strokeWidth="1" />
            <line x1="10" y1="60" x2="20" y2="60" stroke="currentColor" strokeWidth="1" />
            <line x1="100" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="1" />
          </svg>
        )}
        {/* Primary actions */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 px-5 py-2 rounded-lg border border-white/15
                       text-slate-700 dark:text-slate-300 transition-all duration-200
                       hover:text-slate-900 dark:hover:text-slate-100
                       hover:bg-slate-100/5 dark:hover:bg-slate-800/30
                       hover:ring-1 hover:ring-cyan-400/25 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-cyan-400/40"
          >
            View on GitHub
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </a>
          <a
            href="#"
            className="group inline-flex items-center gap-1 px-5 py-2 rounded-lg border border-white/15
                       text-slate-700 dark:text-slate-300 transition-all duration-200
                       hover:text-slate-900 dark:hover:text-slate-100
                       hover:bg-slate-100/5 dark:hover:bg-slate-800/30
                       hover:ring-1 hover:ring-cyan-400/25 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-cyan-400/40"
          >
            Live demo (coming soon)
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </a>
        </div>
        {/* Tech tags */}
        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 6).map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/5 dark:bg-white/5 px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Sections (visual hierarchy & spacing) */}
      {projectDetails[slug] ? (
        <div className="space-y-12">
          <section>
            <div className="surface-panel">
              <h2 className="mb-3 text-xl font-medium tracking-wide text-slate-900 dark:text-slate-100">
                Project Overview
              </h2>
              <p className="text-slate-600 dark:text-slate-200">{projectDetails[slug].overview}</p>
            </div>
          </section>
          <div className="h-px w-full bg-gradient-to-r from-cyan-400/20 via-slate-500/10 to-indigo-400/20" />

          <section className="grid gap-6 sm:grid-cols-2">
            <div className="surface-panel">
              <h3 className="mb-2 text-lg font-medium tracking-wide text-slate-900 dark:text-slate-100">
                Challenge
              </h3>
              <p className="text-slate-600 dark:text-slate-200">{projectDetails[slug].challenge}</p>
            </div>
            <div className="surface-panel">
              <h3 className="mb-2 text-lg font-medium tracking-wide text-slate-900 dark:text-slate-100">
                Solution
              </h3>
              <p className="text-slate-600 dark:text-slate-200">{projectDetails[slug].solution}</p>
            </div>
          </section>
          <div className="h-px w-full bg-gradient-to-r from-cyan-400/20 via-slate-500/10 to-indigo-400/20" />

          <section>
            <div className="surface-panel">
              <h2 className="mb-3 text-xl font-medium tracking-wide text-slate-900 dark:text-slate-100">
                Method & Implementation
              </h2>
              <p className="text-slate-600 dark:text-slate-200">{projectDetails[slug].method}</p>
            </div>
          </section>
          <div className="h-px w-full bg-gradient-to-r from-cyan-400/20 via-slate-500/10 to-indigo-400/20" />

          <section>
            <div className="surface-panel">
              <h2 className="mb-3 text-xl font-medium tracking-wide text-slate-900 dark:text-slate-100">
                Results & Performance
              </h2>
              <p className="text-slate-600 dark:text-slate-200">{projectDetails[slug].results}</p>
              {/* Inline stat chips to highlight key results */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/5 dark:bg-white/5 px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-300">
                  50 Hz streaming
                </span>
                <span className="rounded-full bg-white/5 dark:bg-white/5 px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-300">
                  Low drift
                </span>
                <span className="rounded-full bg-white/5 dark:bg-white/5 px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-300">
                  Multi‑node
                </span>
              </div>
            </div>
          </section>
          <div className="h-px w-full bg-gradient-to-r from-cyan-400/20 via-slate-500/10 to-indigo-400/20" />

          <section>
            <div className="surface-panel">
              <h2 className="mb-3 text-xl font-medium tracking-wide text-slate-900 dark:text-slate-100">
                Ongoing Work
              </h2>
              <p className="text-slate-600 dark:text-slate-200">{projectDetails[slug].ongoing}</p>
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-12">
          <section>
            <div className="surface-panel">
              <h2 className="mb-3 text-xl font-medium tracking-wide text-slate-900 dark:text-slate-100">
                Project Overview
              </h2>
              <p className="text-slate-600 dark:text-slate-200">
                High‑level summary of the project’s purpose, scope, and audience.
              </p>
            </div>
          </section>
          <div className="h-px w-full bg-gradient-to-r from-cyan-400/20 via-slate-500/10 to-indigo-400/20" />
          <section className="grid gap-6 sm:grid-cols-2">
            <div className="surface-panel">
              <h3 className="mb-2 text-lg font-medium tracking-wide text-slate-900 dark:text-slate-100">
                Challenge
              </h3>
              <p className="text-slate-600 dark:text-slate-200">What problem were we solving?</p>
            </div>
            <div className="surface-panel">
              <h3 className="mb-2 text-lg font-medium tracking-wide text-slate-900 dark:text-slate-100">
                Solution
              </h3>
              <p className="text-slate-600 dark:text-slate-200">A concise look at the core idea and approach.</p>
            </div>
          </section>
          <div className="h-px w-full bg-gradient-to-r from-cyan-400/20 via-slate-500/10 to-indigo-400/20" />
          <section>
            <div className="surface-panel">
              <h2 className="mb-3 text-xl font-medium tracking-wide text-slate-900 dark:text-slate-100">
                Method & Implementation
              </h2>
              <p className="text-slate-600 dark:text-slate-200">Stack, frameworks, and how it fits together.</p>
            </div>
          </section>
          <div className="h-px w-full bg-gradient-to-r from-cyan-400/20 via-slate-500/10 to-indigo-400/20" />
          <section>
            <div className="surface-panel">
              <h2 className="mb-3 text-xl font-medium tracking-wide text-slate-900 dark:text-slate-100">
                Results & Performance
              </h2>
              <p className="text-slate-600 dark:text-slate-200">Outcomes, metrics, and performance notes.</p>
            </div>
          </section>
        </div>
      )}

      {/* Footer nav with divider for clearer separation */}
      <div className="mt-10 border-t border-white/10 pt-6">
        <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}


