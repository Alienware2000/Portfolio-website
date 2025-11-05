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
          className="group absolute inset-x-0 bottom-10 mx-auto flex h-10 w-10 items-center justify-center
                     rounded-full
                     ring-1 ring-slate-200/40 dark:ring-slate-800/40
                     bg-white/80 dark:bg-slate-900/70
                     backdrop-blur-sm
                     text-slate-600 dark:text-slate-400
                     hover:text-slate-900 dark:hover:text-slate-100
                     hover:bg-white dark:hover:bg-slate-900
                     shadow-sm dark:shadow-black/20
                     hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/30
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
                     transition-all duration-150"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          exit={{ opacity: 0, y: 4, transition: { duration: 0.25 } }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:translate-y-1">
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
