/**
 * NextSectionButton
 * - overlay: floating indicator (absolute) – original behavior
 * - inline: sits in normal flow centered under content
 * Supports offset scrolling so the next section lands fully in view.
 */
import { motion, useReducedMotion } from "framer-motion";

export default function NextSectionButton({ href, label = "Next section", show = true, variant = "overlay", offset = 96 }) {
  const reduce = useReducedMotion();
  if (!show) return null;

  const handleClick = (e) => {
    if (!href || href[0] !== "#") return; // normal link
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = (window.scrollY || window.pageYOffset) + rect.top - (offset || 0);
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  const base = "mx-auto flex h-8 w-8 items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200";

  if (variant === "inline") {
    return (
      <motion.a
        href={href}
        onClick={handleClick}
        aria-label={label}
        className={`${base} relative mt-10 sm:mt-12`}
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

  // overlay (floating)
  return (
    <motion.a
      href={href}
      onClick={handleClick}
      aria-label={label}
      className={`${base} absolute inset-x-0 bottom-10`}
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
