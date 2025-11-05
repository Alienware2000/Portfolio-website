/**
 * NextSectionButton Component
 * Animated scroll indicator with smooth floating motion and enhanced styling
 */
import { AnimatePresence, motion } from "framer-motion";

export default function NextSectionButton({ href, label = "Next section", show = true }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={href}
          aria-label={label}
          className="group absolute inset-x-0 bottom-10 mx-auto flex h-12 w-12 items-center justify-center
                     rounded-full
                     ring-1 ring-slate-200/30 dark:ring-slate-800/30
                     bg-white/50 dark:bg-slate-900/40
                     backdrop-blur-xl
                     text-slate-600 dark:text-slate-400
                     hover:text-slate-900 dark:hover:text-slate-100
                     hover:ring-slate-300/40 dark:hover:ring-slate-700/40
                     hover:bg-white/70 dark:hover:bg-slate-900/60
                     shadow-lg shadow-black/5 dark:shadow-black/20
                     hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30
                     transition-all duration-500"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          exit={{ opacity: 0, y: 6, transition: { duration: 0.2 } }}
          transition={{ duration: 2.5, repeat: Infinity, ease: [0.25, 0.46, 0.45, 0.94] }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:translate-y-1">
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
