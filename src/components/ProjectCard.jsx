/**
 * ProjectCard Component
 * Interactive project card with gradient lighting effects and smooth hover animations
 */
import { motion } from "framer-motion";

export default function ProjectCard({ title, description, tags = [], link }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.5 }}
      className="group relative rounded-3xl border border-slate-200/40 bg-white/70 dark:border-slate-800/40 dark:bg-slate-900/60
                 p-6 shadow-lg shadow-black/5 dark:shadow-black/20 backdrop-blur-xl
                 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30
                 transition-all duration-700 overflow-hidden"
    >
      {/* Subtle inner glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl
                      bg-gradient-to-br from-sky-400/0 via-emerald-400/0 to-teal-400/0
                      group-hover:from-sky-400/4 group-hover:via-emerald-400/3 group-hover:to-teal-400/2
                      dark:group-hover:from-blue-500/6 dark:group-hover:via-violet-500/5 dark:group-hover:to-indigo-500/4
                      transition-all duration-1000" />

      {/* Content wrapper */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100
                       group-hover:text-sky-600 dark:group-hover:text-blue-400
                       transition-colors duration-500 leading-tight">
          {title}
        </h3>
        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
          {description}
        </p>

        {tags.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {tags.map((t) => (
              <motion.li
                key={t}
                whileHover={{ scale: 1.05, y: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="rounded-xl border border-slate-200/50 dark:border-slate-700/30
                           bg-slate-100/50 dark:bg-slate-800/40
                           px-3 py-1.5 text-xs font-medium
                           text-slate-600 dark:text-slate-400
                           hover:border-sky-300/40 dark:hover:border-blue-500/40
                           hover:text-sky-600 dark:hover:text-blue-400
                           hover:bg-sky-50/40 dark:hover:bg-blue-950/20
                           transition-all duration-500 backdrop-blur-sm"
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
