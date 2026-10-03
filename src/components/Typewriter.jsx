import { useEffect, useState } from "react";

/**
 * Types `text` out with slightly uneven, human timing once `start` is true.
 * Screen readers get the full text immediately via aria-label.
 */
export default function Typewriter({ text, start = true, baseSpeed = 110 }) {
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [count, setCount] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (!start || reduced || count >= text.length) return;
    const char = text[count];
    const delay = char === " " ? baseSpeed * 0.3 : baseSpeed * (1 + Math.random() * 0.25);
    const t = setTimeout(() => setCount((c) => c + 1), count === 0 ? 350 : delay);
    return () => clearTimeout(t);
  }, [start, reduced, count, text, baseSpeed]);

  return (
    <span aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      <span aria-hidden="true" className="blink font-light text-ember">|</span>
    </span>
  );
}
