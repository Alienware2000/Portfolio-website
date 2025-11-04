// import Header from "./components/Header.jsx";
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



export default function App() {
  return (
    <>
      <IntroOverlay name="David Antwi" stayMs={1200} fadeMs={500} />
      <motion.main
        className="mx-auto max-w-5xl px-6 pt-10 sm:pt-14"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 2.6 }}
    >
      {/* <Header /> */}
      <Atmosphere />
      <Navbar />
      <Hero />


      <Reveal>
      <Section id="projects" title="Projects" ambient full>
        <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
            {projects.map(p => <ProjectCard key={p.title} {...p} />)}
        </div>
        <NextSectionButton href="#about" />
      </Section>
      </Reveal>


      <Section id="about" title="About" full>
        <p className="text-gray-700 dark:text-gray-300 max-w-3xl">
            Short bio/About me goes here. Interests, tools, and what I’m learning.
        </p>
        <NextSectionButton href="#contact" />
      </Section>


      <Section id="contact" title="Contact" full className="mb-16">
        <p className="">
          <a className="text-indigo-600 hover:underline" href="https://github.com/Alienware2000" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span className="mx-2 text-gray-400">·</span>
          <a className="text-indigo-600 hover:underline" href="https://www.linkedin.com/in/david-antwi-b17727205/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </p>
      </Section>

      

      <footer className="mt-10 pb-10 text-sm text-gray-500">
        <small>© {new Date().getFullYear()} David Antwi</small>
      </footer>
    </motion.main>
    </>
  );
}
