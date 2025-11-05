/**
 * Section Component
 * Reusable full-height section with ambient lighting and smooth transitions
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function Section({ id, title, children, ambient = false, full = false, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section
      ref={ref}
      id={id}
      className={`relative ${full ? "min-h-[85vh] grid content-start" : "mt-14"} scroll-mt-24 ${className}`}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      {/* Enhanced ambient lighting with gradient personality */}
      {ambient && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mx-auto h-[520px] max-w-5xl rounded-[2rem]
                          bg-gradient-to-b from-transparent via-sky-300/3 to-transparent
                          dark:via-blue-600/6 blur-3xl" />
          {/* Additional subtle gradient overlay */}
          <div className="absolute inset-0 mx-auto max-w-5xl
                          bg-gradient-to-b from-sky-400/0 via-transparent to-transparent
                          dark:from-blue-500/0" />
        </motion.div>
      )}

      {/* Enhanced section title with fade-in animation */}
      {title && (
        <motion.h2
          id={id ? `${id}-title` : undefined}
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
          className="mt-14 text-xl sm:text-2xl font-semibold tracking-tight
                     text-slate-900 dark:text-slate-100 mb-2"
        >
          {title}
        </motion.h2>
      )}

      {/* Content with fade-in animation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1], delay: 0.25 }}
        className={title ? "mt-8" : ""}
      >
        {children}
      </motion.div>
    </section>
  );
}
