import { Trophy } from "lucide-react";
import { achievements } from "../data/profile.js";
import SectionHeading from "./SectionHeading.jsx";

export default function Awards() {
  const wins = achievements.filter((a) => a.tier === "gold");
  const others = achievements.filter((a) => a.tier !== "gold");
  return (
    <section id="awards" className="py-16">
      <SectionHeading index="04" title="Awards" />
      <ul className="grid gap-4 sm:grid-cols-2">
        {wins.map((a) => (
          <li key={a.title + a.event} className="panel flex items-center gap-4 p-4">
            <Trophy size={22} className="shrink-0 text-gold" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold text-gold">{a.title}</p>
              <p className="text-sm text-ink/85">{a.event}</p>
              <p className="mt-0.5 font-mono text-[11px] text-mute">{a.year} · {a.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <ul className="mt-8 grid gap-x-10 gap-y-3 text-sm sm:grid-cols-2">
        {others.map((a) => (
          <li key={a.title + a.event} className="flex gap-3">
            <span className="w-10 shrink-0 font-mono text-xs leading-5 text-mute">{a.year}</span>
            <span>
              <span className="font-medium text-ink">{a.title}</span>
              <span className="text-mute">, {a.event}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
