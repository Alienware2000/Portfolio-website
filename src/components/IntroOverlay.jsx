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

  // Initialize: respect reduced motion and session-level skip
  useEffect(() => {
    const seen = typeof window !== "undefined" && sessionStorage.getItem("introSeen") === "1";
    if (reduce || seen) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setShow(false);
      try { sessionStorage.setItem("introSeen", "1"); } catch (_) {}
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

  // Allow skip on click or key press, mark session seen
  useEffect(() => {
    if (!show) return;
    const skip = () => {
      try { sessionStorage.setItem("introSeen", "1"); } catch (_) {}
      setShow(false);
    };
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
          role="dialog"
          aria-modal="true"
          aria-label="Intro overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          {/* Optional faint grid for continuity */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.02]">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-intro" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-intro)" className="text-slate-300/50 dark:text-slate-700/50" />
            </svg>
          </div>

          {/* Stack: name + tiny prompt line */}
          <div className="relative z-10 grid place-items-center gap-3 sm:gap-4">
            {/* Name */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-none
                         text-slate-900 dark:text-slate-100"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {name}
            </motion.h1>

            {/* Prompt line */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.5, delay: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="font-mono text-sm sm:text-base tracking-wide
                         text-slate-600/90 dark:text-slate-400/90"
            >
              {"> Entering digital workspace"}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
