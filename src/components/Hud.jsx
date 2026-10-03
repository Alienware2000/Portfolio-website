import { useEffect, useState } from "react";
import { profile, SECTIONS } from "../data/profile.js";

export default function Hud({ onResume }) {
  const [active, setActive] = useState("");

  // Highlight the section currently on screen
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-night/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-2.5 sm:px-8">
        <a href="#top" className="shrink-0 font-pixel text-xl text-ember" aria-label="Back to top">
          DA<span className="text-gold">.</span>
        </a>
        <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]" aria-label="Sections">
          {SECTIONS.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`shrink-0 px-2.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                active === s.id ? "bg-raised text-ember" : "text-mute hover:text-ink"
              }`}
            >
              <span className="mr-1 hidden text-line lg:inline">{i + 1}</span>
              {s.label}
            </a>
          ))}
        </nav>
        <a href={profile.resume} onClick={onResume} className="btn btn-primary shrink-0 !px-3 !py-1.5">
          Resume
        </a>
      </div>
    </header>
  );
}
