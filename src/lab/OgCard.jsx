import { caseStudies, profile, stats } from "../data/profile.js";
import Media from "../components/Media.jsx";

// Dev-only: a 1200x630 share card, screenshotted into public/og/ at build-prep time.
// /lab/og renders the home card, /lab/og?slug=<slug> a case study's card.
export default function OgCard() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  const p = caseStudies.find((c) => c.slug === slug);
  return (
    <div className="relative flex h-[630px] w-[1200px] overflow-hidden bg-night text-ink">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 85% 20%, rgb(var(--ember) / 0.14), transparent)" }} />
      {p ? (
        <div className="relative grid w-full grid-cols-[1fr_1.25fr] items-center gap-12 px-16">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.25em] text-ember">David Antwi · Case study</p>
            <h1 className="mt-5 text-6xl font-semibold leading-[1.05] tracking-tight">{p.title}</h1>
            <p className="mt-6 text-2xl leading-snug text-ink/80">{p.case.oneLiner}</p>
            {(p.award || p.metric) && <p className="mt-6 font-mono text-base uppercase tracking-widest text-gold">{p.award || p.metric}</p>}
          </div>
          <div className="w-full">
            <Media project={p} eager />
          </div>
        </div>
      ) : (
        <div className="relative flex w-full items-center gap-14 px-20">
          <img src="/images/portrait-384.jpg" alt="" className="h-56 w-56 shrink-0 border-4 border-ember object-cover" />
          <div>
            <p className="font-mono text-base uppercase tracking-[0.25em] text-mute">{profile.school}</p>
            <h1 className="mt-4 text-7xl font-medium tracking-tight">David Antwi</h1>
            <p className="mt-3 font-mono text-xl text-ember">{profile.role} · {profile.focus}</p>
            <ul className="mt-9 grid grid-cols-2 gap-x-12 gap-y-5">
              {stats.map((s) => (
                <li key={s.label}>
                  <p className="stat-value font-mono text-5xl font-semibold">{s.value}</p>
                  <p className="mt-1 text-lg text-mute">{s.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
