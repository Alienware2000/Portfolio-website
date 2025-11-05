/**
 * Navbar Component
 * Floating glass-style navigation bar with smooth transitions and theme-aware styling
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Minimal floating nav - digital world feel
  const shell = scrolled
    ? "bg-white/60 dark:bg-slate-950/70 shadow-sm shadow-black/3 dark:shadow-black/20 ring-1 ring-slate-200/30 dark:ring-slate-800/30"
    : "bg-white/40 dark:bg-slate-950/50 ring-1 ring-slate-200/20 dark:ring-slate-800/20";

  return (
    <header className="sticky top-4 sm:top-6 z-50">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          className={`h-11 rounded-full px-4 sm:px-5 ${shell} backdrop-blur-sm flex items-center transition-all duration-300`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {/* left spacer keeps center truly centered */}
          <div className="w-9" />

          {/* centered links with refined hover effects */}
          <nav className="mx-auto">
            <ul className="flex items-center gap-6 text-sm">
              {[
                { href: "#projects", label: "Projects" },
                { href: "#about", label: "About" },
                { href: "#skills", label: "Skills" },
                { href: "#contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="px-3 py-1.5 rounded-lg
                               text-slate-700 dark:text-slate-300
                               hover:text-slate-900 dark:hover:text-slate-100
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50
                               transition-all duration-150
                               hover:underline underline-offset-4 decoration-1 decoration-slate-400 dark:decoration-slate-500"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* theme toggle on the right */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </motion.div>
      </div>
    </header>
  );
}
