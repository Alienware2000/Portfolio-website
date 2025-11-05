/**
 * Navbar Component
 * Minimal, clean navigation - inspired by zen aesthetic
 * Simple links with subtle hover states
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#projects", label: "Projects" },
    { href: "#about", label: "About" },
    { href: "#skills", label: "Skills" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-6 z-50">
      <div className="mx-auto max-w-5xl px-6">
        <motion.nav
          className={`flex items-center justify-between h-12 px-6 rounded-full
                     bg-white/50 dark:bg-slate-950/50 backdrop-blur-md
                     border border-slate-200/30 dark:border-slate-800/30
                     ${scrolled ? "shadow-sm" : ""}
                     transition-all duration-300`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Left: Navigation links */}
          <ul className="flex items-center gap-8 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-slate-600 dark:text-slate-400
                             hover:text-slate-900 dark:hover:text-slate-100
                             transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right: Theme toggle */}
          <ThemeToggle />
        </motion.nav>
      </div>
    </header>
  );
}
