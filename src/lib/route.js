import { useEffect, useState } from "react";

// Tiny history router: the site is one page, but each case study gets its own
// shareable URL (/work/<slug>) so a recruiter can forward a single project.
const listeners = new Set();

export function navigate(path, { replace = false } = {}) {
  if (path === window.location.pathname) return;
  window.history[replace ? "replaceState" : "pushState"]({ fromSite: !replace }, "", path);
  listeners.forEach((fn) => fn(path));
}

export function usePath() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const on = () => setPath(window.location.pathname);
    listeners.add(setPath);
    window.addEventListener("popstate", on);
    return () => {
      listeners.delete(setPath);
      window.removeEventListener("popstate", on);
    };
  }, []);
  return path;
}

export const workSlug = (path) => path.match(/^\/work\/([\w-]+)\/?$/)?.[1] ?? null;
