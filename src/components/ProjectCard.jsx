/**
 * ProjectCard Component
 * Minimal project card with white border and retro "hop" hover effect
 * Snappy, responsive video game feel with immediate feedback
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ProjectCard({ title, description, tags = [], link, slug, status, started }) {
  const navigate = useNavigate();

  const getStatusClasses = (s) => {
    if (!s) return "border-white/10 bg-white/5 text-slate-600 dark:text-slate-300";
    const normalized = String(s).toLowerCase();
    if (normalized === "complete" || normalized === "completed") {
      return "border-emerald-500/30 bg-emerald-400/10 text-emerald-300";
    }
    if (normalized === "in progress" || normalized === "ongoing") {
      return "border-amber-400/30 bg-amber-300/10 text-amber-300";
    }
    return "border-white/10 bg-white/5 text-slate-600 dark:text-slate-300";
  };
  return (
    <motion.article
      className="space-y-3 p-6 rounded-lg border border-white/20 dark:border-white/10
                 bg-transparent
                 cursor-pointer"
      onClick={() => navigate(`/project/${slug}`)}
      whileHover={{ 
        y: -8, // More pronounced hop for video game feel
        scale: 1.02, // Slight scale for extra responsiveness
      }}
      whileTap={{
        y: -4, // Smaller hop on tap/click
        scale: 0.98,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 800, // Much stiffer for snappy response
        damping: 15, // Lower damping for quicker bounce
        mass: 0.5, // Lighter mass for faster reaction
      }}
    >
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {(status || started) && (
        <div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${getStatusClasses(status)}`}>
            {status ? status : null}{status && started ? " · " : ""}{started ? started : null}
          </span>
        </div>
      )}
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>

      {tags.length > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-500">
          {tags.slice(0, 4).join(" ")}
        </p>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/project/${slug}`);
        }}
        className="inline-block text-sm text-slate-700 dark:text-slate-300
                   hover:text-slate-900 dark:hover:text-slate-100
                   hover:underline underline-offset-2
                   transition-colors duration-200"
      >
        Open details →
      </button>
    </motion.article>
  );
}
