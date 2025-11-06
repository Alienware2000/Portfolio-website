/**
 * Hero Component
 * Main landing section with typewriter effect
 * Clean, minimal presentation
 */
import { useRef } from "react";
import { useInView, motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import NextSectionButton from "./NextSectionButton.jsx";
import Typewriter from "./Typewriter.jsx";

export default function Hero() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduce = useReducedMotion();

  // Spotlight motion (clamped ±8px offset from center)
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const x = useSpring(mvX, { stiffness: 120, damping: 20, mass: 0.3 });
  const y = useSpring(mvY, { stiffness: 120, damping: 20, mass: 0.3 });

  const handleMouseMove = (e) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    const clamp = (v) => Math.max(-8, Math.min(8, v));
    mvX.set(clamp(relX / 16)); // soften
    mvY.set(clamp(relY / 16));
  };

  const handleMouseLeave = () => {
    mvX.set(0);
    mvY.set(0);
  };

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-[90vh] grid place-content-center text-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >

      {/* Immersive background: gradient field + dot matrix + spotlight */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Slow gradient field */}
        <div className="absolute inset-0 hero-gradient-field opacity-[0.02] dark:opacity-[0.03]" />

        {/* Faint dot matrix */}
        <motion.svg
          className="absolute inset-0 h-full w-full opacity-[0.015] dark:opacity-[0.02]"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ y: 6, opacity: 0 }}
          animate={reduce ? { y: 0, opacity: 1 } : { y: [6, 0, 6], opacity: 1 }}
          transition={reduce ? { duration: 0.3 } : { duration: 30, repeat: Infinity, ease: "easeInOut" }}
        >
          <defs>
            <pattern id="dot-matrix" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-matrix)" className="text-slate-300/60 dark:text-slate-700/60" />
        </motion.svg>

        {/* Mouse-reactive spotlight (very soft) */}
        <motion.div
          style={{ x, y, background: "radial-gradient(closest-side, rgba(255,255,255,0.06), rgba(255,255,255,0) 65%)" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] rounded-full blur-3xl"
        />
      </div>

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
      <NextSectionButton href="#projects" show={inView} />
    </section>
  );
}
