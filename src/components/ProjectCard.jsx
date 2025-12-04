/**
 * ProjectCard Component
 * Minimal project card with thumbnail support and retro "hop" hover effect
 * Snappy, responsive video game feel with immediate feedback
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Placeholder component for projects without images
function ProjectPlaceholder({ title, slug }) {
  // Generate a consistent color gradient based on slug
  const getGradient = (slug) => {
    const gradients = {
      zayfinds: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
      exosense: "from-cyan-500/20 via-blue-500/20 to-indigo-500/20",
      "agentic-gridworld": "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
      "academic-matcher": "from-amber-500/20 via-orange-500/20 to-red-500/20",
      "tinyml-malaria-diagnosis-system": "from-red-500/20 via-rose-500/20 to-pink-500/20",
      "mars-rover-ui-system": "from-slate-500/20 via-gray-500/20 to-zinc-500/20",
      "tinyml-keyword-spotting": "from-violet-500/20 via-purple-500/20 to-fuchsia-500/20",
    };
    return gradients[slug] || "from-slate-400/20 via-slate-500/20 to-slate-600/20";
  };

  // Get initials from title
  const getInitials = (title) => {
    return title
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative w-full h-48 rounded-t-lg overflow-hidden bg-gradient-to-br ${getGradient(slug)}`}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} 
        />
      </div>
      
      {/* Project initials centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-medium text-slate-700/40 dark:text-slate-300/40 tracking-tight">
          {getInitials(title)}
        </span>
      </div>
      
      {/* Subtle border at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export default function ProjectCard({ 
  title, 
  description, 
  tags = [], 
  link, 
  slug, 
  status, 
  started,
  thumbnail, // New prop: can be URL string or null
  image // Alternative prop name
}) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const imageUrl = thumbnail || image || null;
  const showPlaceholder = !imageUrl || imageError;

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
      className="rounded-lg border border-white/20 dark:border-white/10
                 bg-transparent overflow-hidden
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
      {/* Thumbnail or Placeholder */}
      {showPlaceholder ? (
        <ProjectPlaceholder title={title} slug={slug} />
      ) : (
        <div className="relative w-full h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
          <img
            src={imageUrl}
            alt={`${title} thumbnail`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Card Content */}
      <div className="space-y-3 p-6">
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
      </div>
    </motion.article>
  );
}
