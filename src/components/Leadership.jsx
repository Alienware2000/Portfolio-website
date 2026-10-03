import { leadership } from "../data/profile.js";
import SectionHeading from "./SectionHeading.jsx";

export default function Leadership() {
  return (
    <section id="leadership" className="py-16">
      <SectionHeading index="03" title="Leadership" />
      <ul className="divide-y divide-line border-y border-line">
        {leadership.map((g) => (
          <li key={g.org} className="grid gap-x-8 gap-y-1 py-5 md:grid-cols-[18rem_1fr]">
            <div>
              <h3 className="font-semibold text-ink">{g.org}</h3>
              <p className="text-sm text-ember">{g.role}</p>
              <p className={`mt-1 font-mono text-xs ${g.active ? "text-mint" : "text-mute"}`}>{g.dates}</p>
            </div>
            <p className="text-[15px] leading-relaxed text-ink/85">{g.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
