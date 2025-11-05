/**
 * IntroOverlay Component
 * Minimal, zen-like entrance - name fades in and out
 * Sets the philosophical, digital world tone
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function IntroOverlay({
  name = "David Antwi",
  duration = 1800, // Shorter, more immediate
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
                     bg-[#fcfcfb] dark:bg-[#0a0a0c]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          {/* Ultra-minimal name reveal */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight
                       text-slate-900 dark:text-slate-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            {name}
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
