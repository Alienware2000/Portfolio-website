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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px", amount: 0.3 }}
      transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
