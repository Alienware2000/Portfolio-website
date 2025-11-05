/**
 * Typewriter Component
 * Animated text typing effect with blinking cursor
 * Delays start until after intro overlay completes
 */
import { useEffect, useState } from "react";

export default function Typewriter({ text, speed = 80, startDelay = 3000 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    setIsStarted(false);
    let currentIndex = 0;
    let timers = [];

    if (!text || text.length === 0) return;

    // Initial delay to wait for overlay to finish
    const startTimer = setTimeout(() => {
      setIsStarted(true);
      
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          const timer = setTimeout(typeNextChar, speed);
          timers.push(timer);
        }
      };
      
      typeNextChar();
    }, startDelay);

    timers.push(startTimer);

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [text, speed, startDelay]);

  return (
    <span>
      {displayedText}
      {isStarted && <span className="inline-block w-[1ch] animate-blink">|</span>}
    </span>
  );
}
