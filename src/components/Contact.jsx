import { Github, Linkedin, Mail, FileText, Twitter } from "lucide-react";
import { profile } from "../data/profile.js";

export default function Contact({ onResume }) {
  return (
    <section id="contact" className="py-16">
      <div className="panel p-8 text-center sm:p-12">
        <h2 className="font-pixel text-4xl text-ink sm:text-5xl">
          Let's talk<span className="blink text-ember">_</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-mute">
          I'm looking for software engineering internships and I'm always happy to talk about what I've built.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`mailto:${profile.email}`} className="btn btn-primary">
            <Mail size={14} aria-hidden="true" /> {profile.email}
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn">
            <Linkedin size={14} aria-hidden="true" /> LinkedIn
          </a>
          <a href={profile.x} target="_blank" rel="noopener noreferrer" className="btn">
            <Twitter size={14} aria-hidden="true" /> X
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn">
            <Github size={14} aria-hidden="true" /> GitHub
          </a>
          <a href={profile.resume} onClick={onResume} className="btn">
            <FileText size={14} aria-hidden="true" /> Resume
          </a>
        </div>
      </div>
    </section>
  );
}
