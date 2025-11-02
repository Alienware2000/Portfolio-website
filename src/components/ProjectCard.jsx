export default function ProjectCard({ title, description, tags = [], link }) {
  return (
    <article className="rounded-xl border border-gray-200 p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/40">
      <h3 className="text-lg font-semibold dark:text-gray-100">{title}</h3>
      <p className="mt-1 text-gray-700 dark:text-gray-300">{description}</p>

      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {tags.map(t => (
            <li key={t} className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">{t}</li>
          ))}
        </ul>
      )}

      {link && 
      <p className="mt-3">
        <a href={link} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          View project
        </a>
      </p>}

    </article>
  );
}
