import { useEffect, useState } from "react";

const DURATION = 2000;

/**
 * Entrance overlay: the name on black, then "> Entering digital workspace"
 * with a loading bar. Shown once per session; any key or click skips it.
 * Calls onDone when the page underneath is revealed.
 */
const TERMINAL_LINES = [
  "DAVID-OS v2.8 // booting",
  "loading experience.dat ........ OK",
  "loading projects.dat .......... OK",
  "mounting rover autonomy ....... OK",
  "player one ready",
];

export default function BootScreen({ onDone, variant = "workspace", force = false }) {
  const [phase, setPhase] = useState(() => {
    if (variant === "off") return "gone";
    if (force) return "show";
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "gone";
      return sessionStorage.getItem("booted") === "1" ? "gone" : "show";
    } catch {
      return "gone";
    }
  });

  useEffect(() => {
    if (phase === "gone") {
      onDone();
      return;
    }
    if (phase === "leaving") {
      const t = setTimeout(() => setPhase("gone"), 450);
      return () => clearTimeout(t);
    }
    const leave = () => {
      try { sessionStorage.setItem("booted", "1"); } catch { /* storage unavailable */ }
      setPhase("leaving");
    };
    const auto = setTimeout(leave, DURATION);
    window.addEventListener("keydown", leave);
    window.addEventListener("pointerdown", leave);
    return () => {
      clearTimeout(auto);
      window.removeEventListener("keydown", leave);
      window.removeEventListener("pointerdown", leave);
    };
  }, [phase, onDone]);

  if (phase === "gone") return null;
  return (
    <div
      role="presentation"
      className={`fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-night transition-opacity duration-500 ${
        phase === "leaving" ? "opacity-0" : "opacity-100"
      }`}
    >
      {variant === "terminal" ? (
        <div className="w-full max-w-md px-6 font-mono text-sm text-mint">
          {TERMINAL_LINES.map((l, i) => (
            <p key={l} className="mb-1" style={{ animation: `intro-rise 0.15s ${i * 0.26}s both` }}>
              <span className="text-mute">&gt;</span> {l}
            </p>
          ))}
          <p className="blink mt-8 text-center font-pixel text-2xl text-ember" style={{ animationDelay: "1.4s" }}>PRESS ANY KEY</p>
        </div>
      ) : (
      <div className="grid place-items-center gap-4 px-6 text-center">
          <p
            className="text-5xl font-medium leading-none tracking-tight text-ink sm:text-6xl md:text-7xl"
            style={{ animation: "intro-rise 0.6s 0.1s both" }}
          >
            David Antwi
          </p>
          <p className="font-mono text-sm tracking-wide text-mute sm:text-base" style={{ animation: "intro-rise 0.5s 0.3s both" }}>
            {"> Entering digital workspace"}
            <span className="blink">_</span>
          </p>
          <div className="mt-2 h-1 w-40 bg-raised" style={{ animation: "intro-rise 0.5s 0.4s both" }}>
            <div className="h-full origin-left bg-ember" style={{ animation: `intro-load ${DURATION - 500}ms 0.4s steps(12) both` }} />
          </div>
        </div>
      )}
    </div>
  );
}
