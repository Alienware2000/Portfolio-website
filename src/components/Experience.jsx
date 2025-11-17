import { experience } from "../data/experience";

export default function Experience() {
  return (
    <div
      aria-label="Experience timeline"
      role="list"
      className="relative border-l border-white/10 pl-6 space-y-6"
    >
      {experience.map((x) => (
        <div
          key={`${x.org}-${x.role}-${x.start}`}
          role="listitem"
          className="relative"
        >
          <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-slate-300/80 dark:bg-slate-200/70" />
          <p className="text-sm text-slate-900 dark:text-slate-100">
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


