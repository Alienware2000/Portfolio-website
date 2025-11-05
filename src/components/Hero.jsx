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
      {/* Subtle ambient lighting - breathing, unobtrusive */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Primary ambient glow */}
        <div
          className="absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full
                     bg-gradient-to-br from-sky-300/8 via-emerald-300/6 to-teal-300/4
                     dark:from-blue-600/12 dark:via-violet-600/8 dark:to-indigo-600/6
                     blur-3xl animate-breathe"
        />
        {/* Secondary subtle accent */}
        <div
          className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 rounded-full
                     bg-amber-200/3 dark:bg-blue-500/5 blur-3xl animate-breathe"
          style={{ animationDelay: '3s' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1], delay: 2.0 }}
        className="mx-auto max-w-3xl px-2"
      >
        {/* Enhanced typography with refined sizing */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight
                       text-slate-900 dark:text-slate-100
                       leading-[1.08]">
          <Typewriter text="David Antwi" baseSpeed={160} startDelay={2200} />
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="mt-10 text-lg sm:text-xl lg:text-2xl
                     text-slate-700 dark:text-slate-300
                     font-medium leading-relaxed"
        >
          I build ML-powered tools, embedded systems, and TinyML applications.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.0, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="mx-auto mt-7 max-w-2xl text-base sm:text-lg
                     leading-relaxed text-slate-600 dark:text-slate-400"
        >
          Yale EECS student and Research Intern working across machine learning, embedded systems, and web development.
          Recent work: wearable motion tracking, TinyML medical diagnosis, and semantic search systems.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.5, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            href="#projects"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-2xl border border-slate-200/50 bg-white/60 backdrop-blur-xl
                       px-6 py-3 text-sm font-medium text-slate-700
                       hover:bg-white/80 hover:border-slate-300/50 hover:text-slate-900
                       dark:border-slate-800/50 dark:bg-slate-900/50 dark:text-slate-300
                       dark:hover:bg-slate-900/70 dark:hover:border-slate-700/50 dark:hover:text-slate-100
                       shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30
                       transition-all duration-500"
          >
            View projects
          </motion.a>
          <motion.a
            href="https://www.linkedin.com/in/david-antwi-b17727205/"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-2xl px-6 py-3 text-sm font-medium text-white
                       bg-gradient-to-r from-sky-500/90 to-cyan-500/90
                       hover:from-sky-500 hover:to-cyan-500
                       dark:from-blue-600/90 dark:to-violet-600/90
                       dark:hover:from-blue-600 dark:hover:to-violet-600
                       shadow-xl shadow-sky-500/20 dark:shadow-blue-600/20
                       hover:shadow-2xl hover:shadow-sky-500/30 dark:hover:shadow-blue-600/30
                       backdrop-blur-sm transition-all duration-500"
          >
            Connect
          </motion.a>
        </motion.div>
      </motion.div>
      <NextSectionButton href="#projects" show={inView} />
    </section>
  );
}
