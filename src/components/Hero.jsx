import { Github, Linkedin, Mail, FileText, Twitter, ChevronDown } from "lucide-react";
import { profile, stats, now } from "../data/profile.js";
import Typewriter from "./Typewriter.jsx";

const LINKS = [
  { href: profile.github, label: "GitHub", Icon: Github },
  { href: profile.linkedin, label: "LinkedIn", Icon: Linkedin },
  { href: profile.x, label: "X", Icon: Twitter },
];

function Buttons({ onResume, center }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${center ? "justify-center" : ""}`}>
      <a href="#experience" className="btn btn-primary">
        View my work <ChevronDown size={14} aria-hidden="true" />
      </a>
      <a href={profile.resume} onClick={onResume} className="btn">
        <FileText size={14} aria-hidden="true" /> Resume
      </a>
      <span className="flex gap-1">
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label} className="p-2.5 text-mute transition-colors hover:text-ember">
            <l.Icon size={18} aria-hidden="true" />
          </a>
        ))}
        <a href={`mailto:${profile.email}`} aria-label="Email" title="Email" className="p-2.5 text-mute transition-colors hover:text-ember">
          <Mail size={18} aria-hidden="true" />
        </a>
      </span>
    </div>
  );
}

function Status() {
  return (
    <p className="font-mono text-xs text-mint">
      <span className="blink mr-2 inline-block h-2 w-2 bg-mint" aria-hidden="true" />
      {profile.status}
    </p>
  );
}

function Portrait({ className = "" }) {
  return <img src="/images/image.png" alt="David Antwi" width="400" height="400" className={`border-2 border-ember object-cover ${className}`} />;
}

/** The numbers a recruiter is scanning for, plus what I'm doing right now */
function HudStrip() {
  return (
    <div className="border-y border-line py-6">
      <ul className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <p className="font-mono text-2xl font-medium text-gold sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-sm text-mute">{s.label}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-mute">
        <span className="mr-2 font-mono text-xs uppercase tracking-widest text-ember">Now</span>
        {now.join(" · ")}
      </p>
    </div>
  );
}

/** Default: small portrait beside the typewriter name, everything left-aligned */
function Split({ onResume, ready }) {
  return (
    <div className="flex min-h-[calc(100vh-17rem)] flex-col justify-center py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <Portrait className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
        <div>
          <p className="label mb-2">{profile.school}</p>
          <h1 className="text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl">
            <Typewriter text="I'm David Antwi" start={ready} />
          </h1>
        </div>
      </div>
      <p className="mt-7 font-mono text-sm text-mute">{`> ${profile.role} · ${profile.focus}`}</p>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/90 sm:text-xl">{profile.tagline}</p>
      <div className="mt-5"><Status /></div>
      <div className="mt-8"><Buttons onResume={onResume} /></div>
    </div>
  );
}

/** The original look: centered, nothing but type over the particle field */
function Minimal({ onResume, ready }) {
  return (
    <div className="grid min-h-[calc(100vh-12rem)] place-content-center py-16 text-center">
      <h1 className="text-5xl font-medium leading-[1.08] tracking-tight text-ink sm:text-6xl lg:text-7xl">
        <Typewriter text="I'm David Antwi" start={ready} />
      </h1>
      <p className="mt-5 font-mono text-sm text-mute sm:text-base">{`> ${profile.role} · ${profile.focus}`}</p>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink/90 sm:text-xl">{profile.tagline}</p>
      <div className="mt-5"><Status /></div>
      <div className="mt-9"><Buttons onResume={onResume} center /></div>
    </div>
  );
}

/** Full game UI: everything inside one player card */
function Card({ onResume }) {
  return (
    <div className="py-10 lg:py-16">
      <div className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Portrait className="h-28 w-28 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-pixel text-4xl leading-none text-ink sm:text-6xl">{profile.name}</h1>
            <p className="mt-3 text-lg font-medium text-ember">{profile.role}</p>
            <p className="mt-1 font-mono text-xs text-mute">{profile.focus}</p>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/90 sm:text-lg">{profile.tagline}</p>
        <p className="mt-4 font-mono text-xs text-mute">{profile.school} · {profile.location}</p>
        <div className="mt-3"><Status /></div>
        <div className="mt-8"><Buttons onResume={onResume} /></div>
      </div>
    </div>
  );
}

const VARIANTS = { split: Split, minimal: Minimal, card: Card };

export default function Hero({ onResume, ready, variant = "split" }) {
  const Layout = VARIANTS[variant] || Split;
  return (
    <section id="top" className="pb-16">
      <Layout onResume={onResume} ready={ready} />
      <HudStrip />
    </section>
  );
}
