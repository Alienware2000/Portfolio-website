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
                     ring-1 ring-slate-300/50 dark:ring-slate-700/50
                     bg-white/70 dark:bg-slate-900/70
                     backdrop-blur-md
                     text-slate-700 dark:text-slate-300
                     hover:text-sky-600 dark:hover:text-blue-400
                     hover:ring-sky-400/50 dark:hover:ring-blue-500/50
                     hover:bg-white/90 dark:hover:bg-slate-900/90
                     hover:shadow-lg transition-all duration-300"
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
