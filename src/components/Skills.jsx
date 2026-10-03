import { skills, education, about } from "../data/profile.js";
import SectionHeading from "./SectionHeading.jsx";

export default function Skills() {
  return (
    <section id="skills" className="py-16">
      <SectionHeading index="05" title="Skills & Education" />
      <div className="grid gap-6 lg:grid-cols-3">
        {skills.map((group) => (
          <div key={group.title} className="panel p-6">
            <p className="label mb-4">{group.title}</p>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((s) => (
                <li key={s} className="border border-line bg-night/60 px-2.5 py-1 text-sm text-ink/90">{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <p className="label mb-4">Education</p>
          <ul className="space-y-5">
            {education.map((e) => (
              <li key={e.school}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-ink">{e.school}</h3>
                  <span className="font-mono text-xs text-mute">{e.dates}</span>
                </div>
                <p className="text-sm text-ember">{e.degree}</p>
                {e.detail && <p className="mt-2 text-sm leading-relaxed text-mute">{e.detail}</p>}
              </li>
            ))}
          </ul>
          <p className="mt-5 font-mono text-xs text-mute">Spoken: English (native), French (working)</p>
        </div>
        <div className="panel p-6">
          <p className="label mb-4">About</p>
          <img src="/images/image.png" alt="David Antwi" width="96" height="96" className="float-right mb-2 ml-4 h-24 w-24 border-2 border-ember object-cover" />
          <div className="space-y-3 text-[15px] leading-relaxed text-ink/85">
            {about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
