import { useState } from "react";
import { experience } from "../data/profile.js";
import SectionHeading from "./SectionHeading.jsx";

export default function Experience() {
  // Each role shows its two strongest bullets until expanded
  const [open, setOpen] = useState({});
  return (
    <section id="experience" className="py-16">
      <SectionHeading index="01" title="Experience" />
      <ol className="space-y-6">
        {experience.map((job) => (
          <li key={job.org} className="panel p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
              <div>
                <h3 className="text-xl font-semibold text-ink">{job.org}</h3>
                <p className="mt-0.5 text-ember">{job.role}</p>
                <p className="mt-0.5 text-sm text-mute">{job.context}</p>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-mute">
                  {job.start} → {job.end}
                </span>
                {job.active && <span className="border border-mint px-2 py-0.5 uppercase tracking-widest text-mint">Current</span>}
              </div>
            </div>
            <ul className="mt-5 space-y-2.5 text-[15px] leading-relaxed text-ink/90">
              {(open[job.org] ? job.bullets : job.bullets.slice(0, 2)).map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-ember" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {job.stack.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
              {job.bullets.length > 2 && (
                <button
                  type="button"
                  aria-expanded={!!open[job.org]}
                  onClick={() => setOpen((o) => ({ ...o, [job.org]: !o[job.org] }))}
                  className="ml-auto font-mono text-xs uppercase tracking-widest text-ember hover:text-gold"
                >
                  {open[job.org] ? "Show less" : `+ ${job.bullets.length - 2} more`}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
