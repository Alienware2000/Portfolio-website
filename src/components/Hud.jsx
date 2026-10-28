import { useEffect, useState } from "react";
import { profile, SECTIONS } from "../data/profile.js";

export default function Hud({ onResume, inert }) {
  const [active, setActive] = useState("");

  // Highlight the section currently on screen
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    // Back at the hero, no section is current
    const onScroll = () => window.scrollY < window.innerHeight * 0.5 && setActive("");
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header inert={inert} className="sticky top-0 z-30 border-b-2 border-line bg-night/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-2.5 sm:px-8">
        <a href="#top" className="shrink-0 font-pixel text-xl text-ember" aria-label="Back to top">
          DA<span className="text-gold">.</span>
        </a>
        <nav className="flex min-w-0 flex-1 gap-1" aria-label="Sections">
          {SECTIONS.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`${s.primary ? "" : "hidden lg:block"} ${s.id === "skills" ? "hidden min-[440px]:block" : ""} shrink-0 px-2 py-3 font-mono text-[11px] uppercase tracking-wider transition-colors sm:px-2.5 sm:text-xs lg:py-1.5 ${
                active === s.id ? "bg-raised text-ember" : "text-mute hover:text-ink"
              }`}
            >
              <span aria-hidden="true" className="mr-1 hidden text-line lg:inline">{i + 1}</span>
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
