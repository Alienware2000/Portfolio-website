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
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px", amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    >
      {children}
    </motion.div>
  );
}
