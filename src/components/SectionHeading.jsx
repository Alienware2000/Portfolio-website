import { SECTIONS } from "../data/profile.js";

/** Section title; the number comes from the nav order so it never drifts */
export default function SectionHeading({ id, title, children }) {
  const n = SECTIONS.findIndex((s) => s.id === id) + 1;
  return (
    <div className="mb-8">
      <h2 className="font-pixel text-3xl text-ink sm:text-4xl">
        {n > 0 && <span className="mr-3 text-ember">{String(n).padStart(2, "0")}</span>}
        {title}
      </h2>
      {children && <p className="mt-3 max-w-2xl text-mute">{children}</p>}
    </div>
  );
}
