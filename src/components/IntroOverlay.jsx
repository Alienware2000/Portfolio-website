/**
 * IntroOverlay Component
 * Simple, elegant loading screen with name fade-in/fade-out
 * Minimal and smooth entrance experience
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function IntroOverlay({
  name = "David Antwi",
  duration = 2000, // Total duration: fade in, stay, fade out
}) {
  const [show, setShow] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [reduce, duration]);

  // Prevent scroll while overlay is visible
  useEffect(() => {
    const root = document.documentElement;
    if (show) {
      root.classList.add("overflow-hidden");
    } else {
      root.classList.remove("overflow-hidden");
    }
    return () => root.classList.remove("overflow-hidden");
  }, [show]);

  // Allow skip on click or key press
  useEffect(() => {
    if (!show) return;
    const skip = () => setShow(false);
    window.addEventListener("keydown", skip);
    window.addEventListener("click", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("click", skip);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center
                     bg-white dark:bg-[#09090b]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          {/* Background with subtle gradient - warm light, sleek dark */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br 
                       from-[#fafbfc] via-white to-sky-50/10
                       dark:from-[#0a0a0c] dark:via-[#0f0f14] dark:to-blue-950/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.7,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          />

          {/* Name - coordinated fade in/out */}
          <motion.h1
            className="relative z-10 text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight
                       text-slate-900 dark:text-slate-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.7,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.1
            }}
          >
            {name}
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
