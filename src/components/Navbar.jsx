/**
 * Navbar Component
 * Ultra-minimal navigation - pure text links, no backgrounds or borders
 * Vanish on scroll for clean, immersive experience
 * Inspired by minimalist portfolio aesthetic
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      
      // Show navbar when at top or scrolling up
      // Hide when scrolling down past a threshold (50px)
      if (currentScroll < 50) {
        setIsVisible(true);
      } else if (currentScroll > lastScroll) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }
      
      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#projects", label: "Projects" },
    { href: "#about", label: "About" },
    { href: "#skills", label: "Skills" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-8 z-50">
      <div className="mx-auto max-w-5xl px-6">
        <motion.nav
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : -10
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Navigation links - pure text, no styling */}
          <ul className="flex items-center gap-8 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-slate-700 dark:text-slate-300
                             hover:text-slate-900 dark:hover:text-slate-100
                             transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Theme toggle */}
          <ThemeToggle />
        </motion.nav>
      </div>
    </header>
  );
}
