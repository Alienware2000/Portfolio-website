import Hero from "./Hero.jsx";
import ProjectCard from "./ProjectCard.jsx";
import { projects } from "../data/projects.js";
import Section from "./Section.jsx";
import NextSectionButton from "./NextSectionButton.jsx";
import Skills from "./Skills.jsx";

export default function Home() {
  return (
    <>
      <main className="mx-auto max-w-5xl px-6 pt-10 sm:pt-14">
        <Hero />

        {/* Projects Section */}
        <Section id="projects" title="Projects" full className="scroll-mt-[10px] pt-10 sm:pt-12 pb-24">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.title} {...p} />
            ))}
          </div>
          <NextSectionButton href="#about" variant="inline" offset={0} />
        </Section>

        {/* About Section - 3 horizontal paragraphs with borders, vertically centered */}
        <Section id="about" title="About" full className="scroll-mt-28 pt-20 sm:pt-24 pb-24">
          <div className="flex items-center flex-1 min-h-0">
            <div className="mx-auto max-w-6xl w-full">
              {/* Profile Image */}
              <div className="flex justify-center mb-12">
                <img
                  src="/images/image.png"
                  alt="David Antwi"
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-2 border-white/20 dark:border-white/10 shadow-lg"
                  onError={(e) => {
                    // If image fails, show fallback initials
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Fallback initials if image fails */}
                <div 
                  className="hidden w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border-2 border-white/20 dark:border-white/10 shadow-lg items-center justify-center"
                  style={{ display: 'none' }}
                >
                  <span className="text-3xl sm:text-4xl font-medium text-slate-700 dark:text-slate-300">DA</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border border-white/20 dark:border-white/10 bg-transparent">
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  I am an engineering student who learns by building. Most of what I know about computing, robotics, and AI comes from personal projects, lab work, and learning through doing. I am interested in how intelligent systems come together across hardware, software, and machine learning, and I enjoy working in spaces where ideas become prototypes and prototypes become tools that people can actually use. My work spans embedded systems, computer vision, full stack development, and agentic AI, but the common thread is curiosity and a desire to understand how things work at every level.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-white/20 dark:border-white/10 bg-transparent">
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  At Yale, I spend most of my time in technical communities that let me build with others. I work in the Faboratory on soft robotic exosuits, where I design and test wearable sensing systems with microcontrollers, IMUs, and real-time motion pipelines. I help develop the computer vision and electronics stack for the Mars Rover Team, and I mentor students through the Catalyst program as they create their first full stack projects. I also work on personal experiments like agentic AI systems, an academic lab matcher, journaling tools powered by speech and LLMs, and small robotics and embedded projects that help me explore new directions.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-white/20 dark:border-white/10 bg-transparent">
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  I care about making things that are useful and accessible. I want to help build the next generation of tools, learning systems, and intelligent interfaces that support people in their daily lives and help them understand technology rather than fear it. This drives my interest in AI, robotics, education, and the intersection of human creativity and computational systems. I see my portfolio as a record of the ideas I have explored so far and a starting point for the projects I want to build next.
                </p>
              </div>
            </div>
          </div>
          </div>
          {/* No chevron here to keep the section clean once reached */}
        </Section>

        <Section id="skills" title="Skills" full className="scroll-mt-40 pt-20 sm:pt-24 pb-24">
          <Skills />
          {/* <NextSectionButton href="#contact" /> */}
        </Section>

        {/* Contact Section - Call to Action */}
        <Section id="contact" title="Contact" className="scroll-mt-40 pt-16 pb-12">
          <div className="w-full flex justify-center">
            <div className="max-w-3xl text-center">
              <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 mb-4 font-medium">
                Let's work together.
              </p>
              <p className="text-base text-slate-600 dark:text-slate-400 mb-8">
                I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
              </p>

              <div className="flex items-center justify-center gap-8 mb-12">
                <a
                  href="https://github.com/Alienware2000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg border border-white/20 dark:border-white/10
                         text-slate-700 dark:text-slate-300
                         hover:text-slate-900 dark:hover:text-slate-100
                         hover:bg-slate-100/50 dark:hover:bg-slate-800/50
                         hover:underline underline-offset-2
                         transition-all duration-200
                         font-medium"
                >
                  View on GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/david-antwi-b17727205/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg border border-white/20 dark:border-white/10
                         text-slate-700 dark:text-slate-300
                         hover:text-slate-900 dark:hover:text-slate-100
                         hover:bg-slate-100/50 dark:hover:bg-slate-800/50
                         hover:underline underline-offset-2
                         transition-all duration-200
                         font-medium"
                >
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </div>
        </Section>

        <footer className="pb-10 text-center text-sm text-slate-500 dark:text-slate-400">
          <small>© {new Date().getFullYear()} David Antwi</small>
        </footer>
      </main>
    </>
  );
}


