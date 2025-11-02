import { useEffect, useState } from "react";

export default function ThemeToggle() {
  // initialize from DOM (in case inline script already set it)
  const initial = typeof document !== "undefined"
    ? document.documentElement.classList.contains("dark")
    : false;
  const [dark, setDark] = useState(initial);

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
    <button
      onClick={() => setDark(d => !d)}
      aria-label="Toggle dark mode"
      className="rounded-md border border-gray-300 px-3 py-1 text-sm
                 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-neutral-800"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
