import { ArrowRight, ExternalLink, Github, Trophy } from "lucide-react";
import { caseStudies } from "../data/profile.js";
import { navigate } from "../lib/route.js";
import SectionHeading from "./SectionHeading.jsx";
import Media from "./Media.jsx";

const featured = caseStudies.filter((p) => p.featured);

function open(e, p) {
  // Let cmd/ctrl-click open the case study in a new tab
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  navigate(`/work/${p.slug}`);
}

// Award (gold, trophy) or usage number (plain), shown in the cover's title bar so titles line up
function Badge({ p }) {
  if (p.award) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-gold">
        <Trophy size={11} aria-hidden="true" /> {p.award.split(" · ")[0]}
      </span>
    );
  }
  if (p.metric) return <span className="font-mono text-[10px] uppercase tracking-widest text-ink/70">{p.metric}</span>;
  return null;
}

/** The few projects worth a recruiter's 30 seconds, each with its outcome on its face */
export default function Work() {
  return (
    <section id="work" className="py-16">
      <SectionHeading id="work" title="Selected work">
        Click any project for the full story: the problem, what I built, the hard part, and how it fits together.
      </SectionHeading>

      {/* One lead project, six in pairs, then a row of three smaller ones */}
      <div className="grid gap-x-8 gap-y-14 md:grid-cols-6">
        {featured.map((p, i) => {
          const lead = i === 0;
          const small = i >= 7;
          return (
            <article
              key={p.slug}
              className={`group min-w-0 ${lead ? "md:col-span-6 md:grid md:grid-cols-[1.5fr_1fr] md:items-center md:gap-10" : small ? "md:col-span-3 lg:col-span-2" : "md:col-span-3"}`}
            >
              <a href={`/work/${p.slug}`} onClick={(e) => open(e, p)} className="block" aria-label={`${p.title} case study`}>
                <div className="transition-transform duration-200 group-hover:-translate-y-1">
                  <Media project={p} eager={i < 2} badge={<Badge p={p} />} />
                </div>
              </a>
              <div className={lead ? "mt-5 md:mt-0" : "mt-5"}>
                <h3 className={`${small ? "text-xl" : "text-2xl"} font-semibold tracking-tight text-ink`}>
                  <a href={`/work/${p.slug}`} onClick={(e) => open(e, p)} className="hover:text-ember">{p.title}</a>
                </h3>
                <p className={`mt-2 max-w-xl leading-relaxed text-ink/80 ${small ? "text-sm" : "text-[15px]"}`}>{p.case.oneLiner}</p>
                {!small && <p className="mt-2 font-mono text-xs text-mute">{p.case.scope}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-widest">
                  <a href={`/work/${p.slug}`} onClick={(e) => open(e, p)} className="inline-flex min-h-[44px] items-center gap-1.5 text-ember hover:text-gold">
                    Case study <ArrowRight size={13} aria-hidden="true" />
                  </a>
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 text-mute hover:text-ink">
                      Live <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  )}
                  {p.code && (
                    <a href={p.code} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 text-mute hover:text-ink">
                      Code <Github size={12} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
