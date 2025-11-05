/**
 * NextSectionButton Component
 * Ultra-minimal scroll indicator - just an arrow, no background
 */
import { motion } from "framer-motion";

export default function NextSectionButton({ href, label = "Next section", show = true }) {
  if (!show) return null;

  return (
    <motion.a
      href={href}
      aria-label={label}
      className="absolute inset-x-0 bottom-10 mx-auto flex h-8 w-8 items-center justify-center
                 text-slate-600 dark:text-slate-400
                 hover:text-slate-900 dark:hover:text-slate-100
                 transition-colors duration-200"
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
