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
                       leading-[1.08] mb-8">
          <Typewriter text="David Antwi" baseSpeed={140} startDelay={1800} />
        </h1>

        {/* One sentence value statement */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-xl sm:text-2xl text-slate-700 dark:text-slate-300
                     font-normal leading-relaxed mb-8"
        >
          I build ML-powered tools, embedded systems, and TinyML applications.
        </motion.p>

        {/* 2-3 line paragraph with focus areas */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto max-w-2xl text-base sm:text-lg
                     leading-relaxed text-slate-600 dark:text-slate-400 mb-12"
        >
          Yale EECS student and Research Intern working across machine learning, embedded systems, and web development. 
          Focus areas: deploying quantized neural networks on microcontrollers, real-time sensor fusion, and semantic search systems. 
          Currently building wearable motion tracking systems and exploring edge AI deployment.
        </motion.p>

        {/* Two clear CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#projects"
            className="px-6 py-2.5 text-sm text-slate-700 dark:text-slate-300
                       hover:text-slate-900 dark:hover:text-slate-100
                       transition-colors duration-200"
          >
            Projects
          </a>
          <a
            href="https://www.linkedin.com/in/david-antwi-b17727205/"
            className="px-6 py-2.5 text-sm text-slate-900 dark:text-slate-100
                       border border-slate-300 dark:border-slate-700 rounded
                       hover:bg-slate-50 dark:hover:bg-slate-800
                       transition-colors duration-200"
          >
            Connect
          </a>
        </motion.div>
      </motion.div>
      <NextSectionButton href="#projects" show={inView} />
    </section>
  );
}
