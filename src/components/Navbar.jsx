// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // subtle glass that tightens when scrolled a bit
  const shell =
    (scrolled
      ? "bg-white/60 dark:bg-black/40 shadow-lg"
      : "bg-white/30 dark:bg-black/30") +
    " ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-md";

  return (
    <header className="sticky top-4 sm:top-6 z-50">
      <div className="mx-auto max-w-5xl px-6">
        <div className={`h-12 rounded-2xl px-3 sm:px-4 ${shell} flex items-center`}>
          {/* left spacer keeps center truly centered */}
          <div className="w-9" />

          {/* centered links */}
          <nav className="mx-auto">
            <ul className="flex items-center gap-6 text-sm">
              {[
                { href: "#projects", label: "Projects" },
                { href: "#about", label: "About" },
                { href: "#contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="px-2 py-1.5 rounded-lg
                               text-gray-700 dark:text-gray-300
                               hover:text-gray-900 dark:hover:text-white
                               focus:outline-none focus-visible:ring-2
                               focus-visible:ring-[color:var(--accent,_theme(colors.blue.500))] transition-colors"
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
        </div>
      </div>
    </header>
  );
}
