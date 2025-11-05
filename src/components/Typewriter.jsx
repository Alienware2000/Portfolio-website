/**
 * Typewriter Component
 * Natural typing effect for name display
 * Variable speed with pauses for punctuation - feels human-like
 */
import { useEffect, useState } from "react";

export default function Typewriter({ text, baseSpeed = 150, startDelay = 2200 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  // Add natural variation to typing speed
  const getTypingSpeed = (char, index) => {
    let speed = baseSpeed;
    
    // Spaces type faster
    if (char === " ") return speed * 0.3;
    
    // Add slight randomness for natural feel (10-20% variation)
    const variation = speed * (0.1 + Math.random() * 0.1);
    
    // Slight pause after certain characters
    if (char === "," || char === ".") return speed * 1.5;
    
    return speed + variation;
  };

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
          const char = text[currentIndex];
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          
          const speed = getTypingSpeed(char, currentIndex);
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
  }, [text, baseSpeed, startDelay]);

  return (
    <span>
      {displayedText}
      {isStarted && <span className="inline-block w-[1ch] animate-blink">|</span>}
    </span>
  );
}
