/**
 * NextSectionButton Component
 * Simple scroll indicator - minimal floating arrow button
 */
import { motion } from "framer-motion";

export default function NextSectionButton({ href, label = "Next section", show = true }) {
  if (!show) return null;

  return (
    <motion.a
      href={href}
      aria-label={label}
      className="absolute inset-x-0 bottom-10 mx-auto flex h-10 w-10 items-center justify-center
                 rounded-full border border-slate-200/40 dark:border-slate-800/40
                 bg-white/60 dark:bg-slate-900/50
                 text-slate-600 dark:text-slate-400
                 hover:text-slate-900 dark:hover:text-slate-100
                 hover:bg-white/80 dark:hover:bg-slate-900/70
                 transition-all duration-200"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: [0, -4, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.a>
  );
}
