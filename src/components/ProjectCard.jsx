/**
 * ProjectCard Component
 * Interactive project card with gradient lighting effects and smooth hover animations
 */
import { motion } from "framer-motion";

export default function ProjectCard({ title, description, tags = [], link }) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative rounded-lg border border-slate-200/40 dark:border-slate-800/30
                 bg-white/50 dark:bg-slate-900/40
                 p-6
                 hover:bg-white/70 dark:hover:bg-slate-900/60
                 hover:border-slate-300/60 dark:hover:border-slate-700/40
                 transition-all duration-300"
    >

      {/* Content wrapper */}
      <div className="relative z-10">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-3 leading-tight
                       transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {description}
        </p>

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 4).map((t) => (
              <li
                key={t}
                className="rounded-md border border-slate-200/60 dark:border-slate-700/40
                           bg-slate-50/80 dark:bg-slate-800/50
                           px-2.5 py-1 text-xs font-medium
                           text-slate-600 dark:text-slate-400
                           transition-colors duration-150"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        {link && (
          <p>
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-normal
                         text-slate-700 dark:text-slate-300
                         hover:text-slate-900 dark:hover:text-slate-100
                         hover:underline underline-offset-2
                         focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 rounded
                         transition-all duration-200"
            >
              View project
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </p>
        )}
      </div>
    </motion.article>
  );
}
