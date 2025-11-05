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

  // Enhanced glass morphism with refined light/dark theme support
  const shell = scrolled
    ? "bg-white/70 dark:bg-[#0f0f12]/80 shadow-lg shadow-black/5 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/10"
    : "bg-white/50 dark:bg-[#0f0f12]/50 ring-1 ring-black/5 dark:ring-white/5";

  return (
    <header className="sticky top-4 sm:top-6 z-50">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          className={`h-12 rounded-2xl px-3 sm:px-4 ${shell} backdrop-blur-md flex items-center transition-all duration-300`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
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
                    className="relative px-2 py-1.5 rounded-lg
                               text-slate-700 dark:text-slate-300
                               hover:text-sky-600 dark:hover:text-blue-400
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 dark:focus-visible:ring-blue-500/50
                               transition-all duration-300
                               before:absolute before:inset-0 before:rounded-lg
                               before:bg-sky-500/0 hover:before:bg-sky-500/5 dark:hover:before:bg-blue-500/5
                               before:transition-all before:duration-300"
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
