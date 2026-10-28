import { skills, education, about } from "../data/profile.js";
import SectionHeading from "./SectionHeading.jsx";

/** Who I am first, then the short facts: education and the tools I use */
export default function Skills() {
  return (
    <section id="skills" className="py-16">
      <SectionHeading id="skills" title="About" />
      <div className="panel p-6 sm:p-7">
        <img
          src="/images/portrait-192.jpg"
          srcSet="/images/portrait-192.jpg 192w, /images/portrait-384.jpg 384w"
          sizes="96px"
          alt="David Antwi"
          width="192"
          height="192"
          loading="lazy"
          className="float-right mb-2 ml-5 h-24 w-24 border-2 border-ember object-cover"
        />
        <div className="max-w-[68ch] space-y-3 text-[15px] leading-relaxed text-ink/85">
          {about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
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
        </div>
        <div className="panel p-6">
          <p className="label mb-4">Skills</p>
          <dl className="space-y-3 text-sm leading-relaxed">
            {skills.map((group) => (
              <div key={group.title}>
                <dt className="font-mono text-xs uppercase tracking-widest text-mute">{group.title}</dt>
                <dd className="mt-1 text-ink/90">{group.items.join(" · ")}</dd>
              </div>
            ))}
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-mute">Spoken</dt>
              <dd className="mt-1 text-ink/90">English (native) · French (working)</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
