import { experience } from "../data/experience";

export default function Experience() {
  return (
    <div
      aria-label="Experience timeline"
      role="list"
      className="relative space-y-4 sm:space-y-6 sm:pl-6"
    >
      {experience.map((x, i) => (
        <div
          key={`${x.org}-${x.role}-${x.start}`}
          role="listitem"
          className="relative pt-4 sm:pt-0 sm:after:content-[''] sm:after:absolute sm:after:left-0 sm:after:top-4 sm:after:bottom-0 sm:after:w-px sm:after:bg-white/10 sm:last:after:hidden"
        >
          {/* Mobile divider between items */}
          {i > 0 && <div className="sm:hidden absolute inset-x-0 top-0 h-px bg-white/10" />}
          {/* Timeline dot (desktop only) */}
          <span className="hidden sm:block absolute -left-1.5 top-2 h-3 w-3 rounded-full bg-slate-300/80 dark:bg-slate-200/70" />

          <div className="sm:flex sm:items-baseline sm:gap-2">
            <p className="text-xs sm:text-sm text-slate-200 dark:text-slate-100">
              <span className="font-medium text-slate-100">{x.role}</span>, {x.org}
            </p>
            <span className="hidden sm:inline text-xs text-slate-400">
              · {x.location} · {x.start}{x.end ? ` - ${x.end}` : ""}
            </span>
          </div>

          <p className="sm:hidden text-xs text-slate-400 mt-0.5">
            {x.location} · {x.start}{x.end ? ` - ${x.end}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}


