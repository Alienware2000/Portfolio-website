/**
 * Reveal Component
 * Scroll-triggered fade-in animation wrapper with reduced motion support
 */
import { motion, useReducedMotion } from "framer-motion";

export default function Reveal({ children, delay = 0, className = "" }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    // No animation for users who prefer reduced motion
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px", amount: 0.35 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
