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

  // Refined glass morphism - warm light, sleek dark
  const shell = scrolled
    ? "bg-white/60 dark:bg-slate-950/70 shadow-xl shadow-black/5 dark:shadow-black/30 ring-1 ring-slate-200/20 dark:ring-slate-800/30"
    : "bg-white/40 dark:bg-slate-950/50 ring-1 ring-slate-200/10 dark:ring-slate-800/20";

  return (
    <header className="sticky top-4 sm:top-6 z-50">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          className={`h-12 rounded-3xl px-3 sm:px-4 ${shell} backdrop-blur-xl flex items-center transition-all duration-500`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
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
                    className="relative px-3 py-1.5 rounded-xl
                               text-slate-600 dark:text-slate-400
                               hover:text-slate-900 dark:hover:text-slate-100
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/30 dark:focus-visible:ring-blue-500/30
                               transition-all duration-500
                               before:absolute before:inset-0 before:rounded-xl
                               before:bg-slate-200/0 hover:before:bg-slate-200/30 dark:hover:before:bg-slate-800/30
                               before:transition-all before:duration-500"
                  >
                    <span className="relative z-10">{l.label}</span>
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
