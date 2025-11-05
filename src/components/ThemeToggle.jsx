/**
 * ThemeToggle Component
 * Smooth theme switcher with animated icon transitions and enhanced hover states
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        stroke="currentColor" strokeWidth="1.5" fill="none"
      />
    </svg>
  );
}

export default function ThemeToggle() {
  // Initialize theme from localStorage or system preference
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement.classList;
    if (dark) {
      root.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <motion.button
      onClick={() => setDark(d => !d)}
      aria-label="Toggle dark mode"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg
                 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white
                 ring-1 ring-transparent hover:ring-gray-300/60 dark:hover:ring-gray-700/60
                 hover:bg-gray-100/50 dark:hover:bg-gray-800/50
                 transition-all duration-200"
    >
      <span className="relative block h-5 w-5">
        {/* Smooth icon cross-fade with rotation */}
        <motion.div
          initial={false}
          animate={{ rotate: dark ? 0 : 180, opacity: dark ? 0 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <SunIcon className="h-5 w-5" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ rotate: dark ? 0 : -180, opacity: dark ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <MoonIcon className="h-5 w-5" />
        </motion.div>
      </span>
    </motion.button>
  );
}
