import { experience } from "../data/experience";

export default function Experience() {
  return (
    <div
      aria-label="Experience timeline"
      role="list"
      className="relative space-y-4 sm:space-y-6 sm:border-l sm:border-white/10 sm:pl-6"
    >
      {experience.map((x, i) => (
        <div
          key={`${x.org}-${x.role}-${x.start}`}
          role="listitem"
          className="relative pt-4 sm:pt-0"
        >
          {/* Mobile divider between items */}
          {i > 0 && <div className="sm:hidden absolute inset-x-0 top-0 h-px bg-white/10" />}
          {/* Timeline dot (desktop only) */}
          <span className="hidden sm:block absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-slate-300/80 dark:bg-slate-200/70" />
          <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-normal break-words">
            <span className="font-medium">{x.role}</span>, {x.org}
            <span className="text-slate-500 dark:text-slate-400">
              {" "}
              · {x.location} · {x.start}
              {x.end ? ` - ${x.end}` : ""}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}


