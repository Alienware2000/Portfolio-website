import { useEffect, useState } from "react";
import { SECTIONS } from "../data/profile.js";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** Number keys jump between sections; the Konami code unlocks a small easter egg. */
export default function useShortcuts() {
  const [toast, setToast] = useState("");

  useEffect(() => {
    let progress = 0;
    let timer;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const n = Number(e.key);
      if (n >= 1 && n <= SECTIONS.length) {
        document.getElementById(SECTIONS[n - 1].id)?.scrollIntoView();
        return;
      }

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        setToast("Cheat code accepted. Achievement unlocked: you read the whole portfolio.");
        clearTimeout(timer);
        timer = setTimeout(() => setToast(""), 5000);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, []);

  return toast;
}
