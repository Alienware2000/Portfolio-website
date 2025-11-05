/**
 * ProjectCard Component
 * Simple project card with clean layout
 */
export default function ProjectCard({ title, description, tags = [], link }) {
  return (
    <article
      className="rounded-lg border border-slate-200/40 dark:border-slate-800/30
                 bg-white/50 dark:bg-slate-900/40
                 p-6 hover:bg-white/70 dark:hover:bg-slate-900/60
                 transition-colors duration-200"
    >

      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
        {description}
      </p>

      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 4).map((tag) => (
            <li
              key={tag}
              className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400
                         border border-slate-200/60 dark:border-slate-700/40 rounded"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-slate-700 dark:text-slate-300
                     hover:text-slate-900 dark:hover:text-slate-100
                     hover:underline transition-colors duration-200"
        >
          View project →
        </a>
      )}
    </article>
  );
}
