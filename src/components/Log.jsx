import { ArrowRight } from "lucide-react";
import { building } from "../data/profile.js";
import { navigate } from "../lib/route.js";
import SectionHeading from "./SectionHeading.jsx";

/** What I'm working on right now: one line per project, kept current in profile.js */
export default function Log() {
  if (!building.length) return null;
  return (
    <section id="now" className="py-16">
      <SectionHeading id="now" title="Building now">
        What I'm working on right now.
      </SectionHeading>
      <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
        {building.map((b) => (
          <li key={b.tag} className="flex flex-col gap-2 bg-night p-5">
            <p className="font-mono text-[11px] uppercase tracking-widest">
              <span className="text-ember">{b.tag}</span>
              {b.org && <span className="text-mute"> · {b.org}</span>}
            </p>
            <p className="text-[15px] leading-relaxed text-ink/90">{b.text}</p>
            {b.slug && (
              <a
                href={`/work/${b.slug}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey) return;
                  e.preventDefault();
                  navigate(`/work/${b.slug}`);
                }}
                className="mt-auto inline-flex items-center gap-1.5 pt-1 font-mono text-xs uppercase tracking-widest text-mute hover:text-ember"
              >
                Case study <ArrowRight size={12} aria-hidden="true" />
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
