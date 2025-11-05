/**
 * ProjectCard Component
 * Interactive project card with gradient lighting effects and smooth hover animations
 */
import { motion } from "framer-motion";

export default function ProjectCard({ title, description, tags = [], link }) {
  return (
    <motion.article
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
      className="group relative rounded-2xl border border-slate-200/80 bg-white/90 dark:border-slate-700/80 dark:bg-slate-900/80
                 p-6 shadow-md backdrop-blur-sm
                 hover:shadow-xl hover:shadow-sky-500/10 dark:hover:shadow-blue-500/20
                 transition-all duration-500 overflow-hidden"
    >
      {/* Gradient lighting effect on hover - new color scheme */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl
                      bg-gradient-to-br from-sky-400/0 via-emerald-400/0 to-teal-400/0
                      group-hover:from-sky-400/8 group-hover:via-emerald-400/6 group-hover:to-teal-400/4
                      dark:group-hover:from-blue-500/12 dark:group-hover:via-violet-500/10 dark:group-hover:to-indigo-500/8
                      transition-all duration-700" />

      {/* Subtle ring glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl
                      ring-0 ring-sky-400/0
                      group-hover:ring-8 group-hover:ring-sky-400/10 dark:group-hover:ring-blue-500/20
                      transition-all duration-500" />

      {/* Content wrapper */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100
                       group-hover:text-sky-600 dark:group-hover:text-blue-400
                       transition-colors duration-300">
          {title}
        </h3>
        <p className="mt-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          {description}
        </p>

        {tags.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {tags.map((t) => (
              <motion.li
                key={t}
                whileHover={{ scale: 1.05, y: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="rounded-lg border border-slate-300/60 dark:border-slate-700/60
                           bg-slate-50/80 dark:bg-slate-800/60
                           px-3 py-1.5 text-xs font-medium
                           text-slate-700 dark:text-slate-300
                           hover:border-sky-400/60 dark:hover:border-blue-500/60
                           hover:text-sky-700 dark:hover:text-blue-400
                           hover:bg-sky-50/50 dark:hover:bg-blue-950/30
                           transition-all duration-300"
              >
                {t}
              </motion.li>
            ))}
          </ul>
        )}

        {link && (
          <motion.p className="mt-5">
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium
                         text-sky-600 dark:text-blue-400
                         hover:text-sky-700 dark:hover:text-blue-300
                         hover:gap-2 transition-all duration-300"
            >
              View project
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </motion.p>
        )}
      </div>
    </motion.article>
  );
}
