/**
 * Hero Component
 * Main landing section with animated typewriter effect and refined typography
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
      {/* Enhanced gradient lighting with new color personality */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Primary glow - teal/emerald for light, blue/violet for dark */}
        <div
          className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full
                     bg-gradient-to-br from-sky-400/20 via-emerald-400/15 to-teal-400/10
                     dark:from-blue-500/25 dark:via-violet-500/20 dark:to-indigo-500/15
                     blur-3xl animate-gradient"
        />
        {/* Secondary accent glow */}
        <div
          className="absolute left-1/2 top-32 h-64 w-64 -translate-x-1/2 rounded-full
                     bg-cyan-400/8 dark:bg-blue-400/12 blur-2xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mx-auto max-w-3xl px-2"
      >
        {/* Enhanced typography with refined sizing */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight
                       text-gray-900 dark:text-gray-100
                       leading-[1.1]">
          <Typewriter text="David Antwi" speed={100} startDelay={3000} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-8 text-lg sm:text-xl lg:text-2xl
                     text-gray-700 dark:text-gray-300
                     font-medium leading-relaxed"
        >
          I build ML-powered tools, embedded systems, and clean web apps.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg
                     leading-relaxed text-gray-600 dark:text-gray-400"
        >
          Yale EECS student and Catalyst Mentor working across AI/ML, robotics, and modern frontend.
          Recent work: an academic-lab matcher, a voice-journaling app, and wearable robotics.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-xl border border-slate-300/80 bg-white/90 backdrop-blur-sm
                       px-6 py-3 text-sm font-medium text-slate-900
                       hover:bg-slate-50 hover:border-sky-300/60
                       dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100
                       dark:hover:bg-slate-800/90 dark:hover:border-blue-500/60
                       shadow-sm hover:shadow-lg transition-all duration-300"
          >
            View projects
          </motion.a>
          <motion.a
            href="https://www.linkedin.com/in/david-antwi-b17727205/"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-xl px-6 py-3 text-sm font-medium text-white
                       bg-gradient-to-r from-sky-500 to-cyan-500
                       hover:from-sky-400 hover:to-cyan-400
                       dark:from-blue-500 dark:to-violet-500
                       dark:hover:from-blue-400 dark:hover:to-violet-400
                       shadow-lg hover:shadow-xl shadow-sky-500/30 dark:shadow-blue-500/30
                       transition-all duration-300"
          >
            Connect
          </motion.a>
        </motion.div>
      </motion.div>
      <NextSectionButton href="#projects" show={inView} />
    </section>
  );
}
