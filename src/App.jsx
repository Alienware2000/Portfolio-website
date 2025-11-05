/**
 * App Component
 * Main application component with smooth section transitions and refined visual design
 */
import IntroOverlay from "./components/IntroOverlay.jsx";
import Hero from "./components/Hero.jsx";
import Navbar from "./components/Navbar.jsx";
import ProjectCard from "./components/ProjectCard.jsx";
import { projects } from "./data/projects.js";
import Atmosphere from "./components/Atmosphere.jsx";
import Reveal from "./components/Reveal.jsx";
import Section from "./components/Section.jsx";
import { motion } from "framer-motion";
import NextSectionButton from "./components/NextSectionButton.jsx";
import Skills from "./components/Skills.jsx";



export default function App() {
  return (
    <>
      <IntroOverlay name="David Antwi" duration={1800} />
      <motion.main
        className="mx-auto max-w-5xl px-6 pt-10 sm:pt-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 1.8 }}
    >
      {/* <Header /> */}
      <Atmosphere />
      <Navbar />
      <Hero />


      <Reveal>
      <Section id="projects" title="Projects" ambient full>
        <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3">
            {projects.map(p => <ProjectCard key={p.title} {...p} />)}
        </div>
        <NextSectionButton href="#about" />
      </Section>
      </Reveal>


      <Section id="about" title="About" full>
        <div className="mx-auto max-w-3xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="space-y-6"
          >
            <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              I'm an Electrical Engineering and Computer Science student at Yale University, graduating in May 2028. 
              I build intelligent systems that bridge hardware and software—from deploying quantized neural networks 
              on microcontrollers to real-time sensor fusion and semantic search systems. My work combines rigorous 
              engineering with practical impact.
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Currently, I'm a Research Intern at The Faboratory at Yale, building wearable motion tracking systems 
              with embedded sensor fusion. I'm also a Software Developer on the Yale Mars Rover Team, co-developing 
              rover UI systems that connect Next.js frontends with Python backends for real-time motor control and 
              camera streaming. As a Catalyst Mentor with the Yale Computer Science Society, I guide students 
              through web development projects and help them build their own portfolios.
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Previously, I worked as an ML Research Intern with the MISE Research Program in Ghana, where I trained 
              CNNs for EEG signal decoding, built TinyML malaria diagnosis systems achieving 93% on-device accuracy, 
              and developed ML classifiers for drug combination prediction. I'm always excited to work on projects that 
              combine technical depth with real-world impact, whether that's deploying AI at the edge, building semantic 
              search systems, or creating tools that make complex technology more accessible.
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Looking ahead, I'm exploring edge AI deployment, reinforcement learning for robotics control, and building 
              more intuitive developer tools. I'm particularly interested in projects that push the boundaries of what's 
              possible at the intersection of machine learning, embedded systems, and human-centered design.
            </p>
          </motion.div>
        </div>
        <NextSectionButton href="#skills" />
      </Section>

      <Section id="skills" title="Skills" full>
        <Skills />
        <NextSectionButton href="#contact" />
      </Section>

      <Section id="contact" title="Contact" full className="mb-16">
        <div className="flex flex-col items-center gap-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="text-base sm:text-lg text-center text-slate-600 dark:text-slate-400 max-w-2xl"
          >
            Let's connect and build something amazing together.
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.a
              href="https://github.com/Alienware2000"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300/60 dark:border-slate-700/40
                         bg-white dark:bg-slate-900
                         px-5 py-2.5 text-sm font-medium
                         text-slate-700 dark:text-slate-300
                         hover:bg-slate-50 dark:hover:bg-slate-800
                         hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
                         transition-all duration-150"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/david-antwi-b17727205/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300/60 dark:border-slate-700/40
                         bg-white dark:bg-slate-900
                         px-5 py-2.5 text-sm font-medium
                         text-slate-700 dark:text-slate-300
                         hover:bg-slate-50 dark:hover:bg-slate-800
                         hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
                         transition-all duration-150"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </motion.a>
          </div>
        </div>
      </Section>

      <footer className="mt-16 pb-10 text-center text-sm text-slate-500 dark:text-slate-400">
        <small>© {new Date().getFullYear()} David Antwi</small>
      </footer>
    </motion.main>
    </>
  );
}
