/**
 * ProjectCard Component
 * Ultra-minimal project card - no borders, backgrounds, or decorations
 * Pure typography-focused layout
 */
export default function ProjectCard({ title, description, tags = [], link }) {
  return (
    <article className="space-y-3">
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>

      {tags.length > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-500">
          {tags.slice(0, 4).join(" ")}
        </p>
      )}

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm text-slate-700 dark:text-slate-300
                     hover:text-slate-900 dark:hover:text-slate-100
                     transition-colors duration-200"
        >
          View project →
        </a>
      )}
    </article>
  );
}
