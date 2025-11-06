/**
 * App Component
 * Main application entry point
 * Clean, minimal layout with zen-inspired aesthetic
 */
import IntroOverlay from "./components/IntroOverlay.jsx";
import Hero from "./components/Hero.jsx";
import Navbar from "./components/Navbar.jsx";
import ProjectCard from "./components/ProjectCard.jsx";
import { projects } from "./data/projects.js";
import Atmosphere from "./components/Atmosphere.jsx";
import Section from "./components/Section.jsx";
import NextSectionButton from "./components/NextSectionButton.jsx";
import Skills from "./components/Skills.jsx";

export default function App() {
  return (
    <>
      <IntroOverlay name="David Antwi" duration={1800} />
      <Atmosphere />
      
      <main className="mx-auto max-w-5xl px-6 pt-10 sm:pt-14 snap-y snap-proximity">
        <Navbar />
        <Hero />

        {/* Projects Section */}
        <Section id="projects" title="Projects" full className="mb-24">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.title} {...p} />
            ))}
          </div>
          <NextSectionButton href="#about" variant="inline" offset={96} />
        </Section>

        {/* About Section - 3 horizontal paragraphs with borders, vertically centered */}
        <Section id="about" title="About" full className="mb-24">
          <div className="flex items-center flex-1 min-h-0">
            <div className="mx-auto max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border border-white/20 dark:border-white/10 bg-transparent">
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  I'm an Electrical Engineering and Computer Science student at Yale University, graduating in May 2028. 
                  I build intelligent systems that bridge hardware and software—from deploying quantized neural networks 
                  on microcontrollers to real-time sensor fusion and semantic search systems.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-white/20 dark:border-white/10 bg-transparent">
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  Currently, I'm a Research Intern at The Faboratory at Yale, building wearable motion tracking systems 
                  with embedded sensor fusion. I'm also a Software Developer on the Yale Mars Rover Team, co-developing 
                  rover UI systems, and a Catalyst Mentor with the Yale Computer Science Society, guiding students 
                  through web development projects.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-white/20 dark:border-white/10 bg-transparent">
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  Previously, I worked as an ML Research Intern with the MISE Research Program in Ghana, where I trained 
                  CNNs for EEG signal decoding, built TinyML malaria diagnosis systems achieving 93% on-device accuracy, 
                  and developed ML classifiers for drug combination prediction.
                </p>
              </div>
            </div>
          </div>
          <NextSectionButton href="#skills" />
        </Section>

      <Section id="skills" title="Skills" full>
        <Skills />
        <NextSectionButton href="#contact" />
      </Section>

      {/* Contact Section - Call to Action */}
      <Section id="contact" title="Contact" className="mb-12">
        <div className="mx-auto max-w-2xl text-center">
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
      </Section>

      <footer className="pb-10 text-center text-sm text-slate-500 dark:text-slate-400">
        <small>© {new Date().getFullYear()} David Antwi</small>
      </footer>
    </main>
    </>
  );
}
