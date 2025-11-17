/**
 * Hero Component
 * Main landing section with typewriter effect
 * Clean, minimal presentation
 */
import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import NextSectionButton from "./NextSectionButton.jsx";
import Typewriter from "./Typewriter.jsx";

export default function Hero() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.6 });

  const scrollToWithOffset = (hash, offset = 64) => {
    const el = document.querySelector(hash);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = (window.scrollY || window.pageYOffset) + rect.top - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-[90vh] grid place-content-center text-center"
    >

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 1.8 }}
        className="mx-auto max-w-3xl px-2"
      >
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight
                       text-slate-900 dark:text-slate-100
                       leading-[1.08] mb-4 whitespace-nowrap">
          <Typewriter text="I'm David Antwi" baseSpeed={140} startDelay={1800} />
        </h1>

        {/* Prompt line */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-mono text-base sm:text-lg text-slate-600/90 dark:text-slate-400/90 mb-6"
        >
          {"> Engineering across hardware + software"}
        </motion.p>

        {/* One sentence value statement */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-xl sm:text-2xl text-slate-700 dark:text-slate-300
                     font-normal leading-relaxed mb-8"
        >
          I design and build intelligent systems that bridge silicon and software.
        </motion.p>

        {/* 2-3 line paragraph with focus areas */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto max-w-2xl text-base sm:text-lg
                     leading-relaxed text-slate-600 dark:text-slate-400 mb-12"
        >
          Yale EECS student and Research Intern working across embedded systems, TinyML, sensor fusion, and semantic search.
          Lately, I have been deploying quantized neural networks on microcontrollers and building wearable motion tracking systems.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-center justify-center mb-4"
        >
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              scrollToWithOffset('#projects', 10);
            }}
            className="text-sm text-slate-700 dark:text-slate-300
                       hover:text-slate-900 dark:hover:text-slate-100
                       hover:underline underline-offset-2
                       transition-colors duration-200"
          >
            Explore Projects
          </a>
        </motion.div>

        {/* Secondary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="https://github.com/Alienware2000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-700 dark:text-slate-300
                       hover:text-slate-900 dark:hover:text-slate-100
                       hover:underline underline-offset-2
                       transition-colors duration-200"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/david-antwi-b17727205/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-700 dark:text-slate-300
                       hover:text-slate-900 dark:hover:text-slate-100
                       hover:underline underline-offset-2
                       transition-colors duration-200"
          >
            LinkedIn
          </a>
          <a
            href="https://docs.google.com/document/d/1dG3RB7G0t2EGW9VvXpHzEef261Usfg7uScn-jP6IdEE/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-700 dark:text-slate-300
                       hover:text-slate-900 dark:hover:text-slate-100
                       hover:underline underline-offset-2
                       transition-colors duration-200"
          >
            Resume
          </a>
          <a
            href="mailto:antwidavid389@gmail.com?subject=Hi%20David%20%E2%80%94%20from%20your%20portfolio&body=Hi%20David,"
            className="text-sm text-slate-700 dark:text-slate-300
                       hover:text-slate-900 dark:hover:text-slate-100
                       hover:underline underline-offset-2
                       transition-colors duration-200"
          >
            Email
          </a>
        </motion.div>
      </motion.div>
      <NextSectionButton href="#projects" show={inView} offset={0} />
    </section>
  );
}
