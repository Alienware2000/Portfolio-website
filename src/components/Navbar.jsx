/**
 * Navbar Component
 * Ultra-minimal navigation - pure text links, no backgrounds or borders
 * Vanish on scroll for clean, immersive experience
 * Inspired by minimalist portfolio aesthetic
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const heroBottomRef = useRef(0);
  const rafRef = useRef(0);

  const scrollToWithOffset = (hash, offset = 64) => {
    const el = document.querySelector(hash);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = (window.scrollY || window.pageYOffset) + rect.top - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  useEffect(() => {
    const computeHeroBottom = () => {
      const hero = document.getElementById("hero");
      if (!hero) {
        heroBottomRef.current = 120; // fallback small threshold
        return;
      }
      const rect = hero.getBoundingClientRect();
      const scrollTop = window.scrollY || window.pageYOffset;
      heroBottomRef.current = rect.top + scrollTop + rect.height;
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        // Show only when user is essentially at the very top.
        // As soon as any downward scroll happens, hide the navbar.
        const show = y <= 1; // hide immediately after any downward scroll
        setIsVisible(show);
      });
    };

    computeHeroBottom();
    window.addEventListener("resize", computeHeroBottom, { passive: true });
    window.addEventListener("load", computeHeroBottom, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    // Set initial state
    onScroll();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", computeHeroBottom);
      window.removeEventListener("load", computeHeroBottom);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Rely on Tailwind scroll-mt-* per section for anchor landing

  const navLinks = [
    // Keeping links minimal; Experience can be reached via chevron from Hero
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
                  onClick={(e) => {
                    if (link.href === "#projects") {
                      e.preventDefault();
                      scrollToWithOffset("#projects", 10);
                    }
                  }}
                  className="text-slate-700 dark:text-slate-300
                             hover:text-slate-900 dark:hover:text-slate-100
                             hover:underline underline-offset-2
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
