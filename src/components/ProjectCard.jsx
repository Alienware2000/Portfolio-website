export default function ProjectCard({ title, description, tags = [], link }) {
  return (
    <article className="rounded-xl border border-gray-200/70 p-5 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-gray-700">{description}</p>

      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {tags.map(t => (
            <li key={t} className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">{t}</li>
          ))}
        </ul>
      )}

      {link && 
      <p className="mt-3">
        <a href={link} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline">
          View project
        </a>
      </p>}

    </article>
  );
}
