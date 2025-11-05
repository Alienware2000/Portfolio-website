/**
 * IntroOverlay Component
 * Full-screen introductory overlay that fades into the main site
 * Supports skip interaction and respects reduced motion preferences
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function IntroOverlay({
  name = "David Antwi",
  stayMs = 2000,        // stays visible for about 2s before fade
  fadeMs = 700,         // fade a bit slower (optional)

}) {
  const [show, setShow] = useState(true);
  const reduce = useReducedMotion();

  // auto-hide after a short moment
  useEffect(() => {
    if (reduce) { setShow(false); return; }
    const t = setTimeout(() => setShow(false), stayMs);
    return () => clearTimeout(t);
  }, [reduce, stayMs]);

  // prevent scroll while overlay is visible
  useEffect(() => {
    const root = document.documentElement;
    if (show) root.classList.add("overflow-hidden");
    else root.classList.remove("overflow-hidden");
    return () => root.classList.remove("overflow-hidden");
  }, [show]);

  // allow user to skip on click or key press
  useEffect(() => {
    const skip = () => setShow(false);
    if (!show) return;
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
                     bg-white dark:bg-black text-black dark:text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: fadeMs / 1000 } }}
        >
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={reduce ? {} : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl sm:text-7xl font-semibold tracking-tight"
          >
            {name}
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
