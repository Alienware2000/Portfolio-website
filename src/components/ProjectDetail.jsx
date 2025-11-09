import { Link, useParams } from "react-router-dom";
import { projects } from "../data/projects";

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Project not found
        </h1>
        <p className="mb-8 text-slate-600 dark:text-slate-400">
          The project you’re looking for doesn’t exist or its page hasn’t been created yet.
        </p>
        <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <h1 className="mb-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {project.title}
      </h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400">{project.description}</p>

      {/* Primary links */}
      <div className="mb-12 flex flex-wrap items-center gap-4">
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 rounded-lg border border-white/20 dark:border-white/10
                     text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100
                     hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200"
        >
          View on GitHub
        </a>
        <a
          href="#"
          className="px-5 py-2 rounded-lg border border-white/20 dark:border-white/10
                     text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100
                     hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200"
        >
          Live demo (coming soon)
        </a>
      </div>

      {/* Placeholder sections */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-medium text-slate-900 dark:text-slate-100">Project Overview</h2>
        <p className="text-slate-600 dark:text-slate-400">
          High‑level summary of the project’s purpose, scope, and audience. We’ll fill this in next.
        </p>
      </section>

      <section className="mb-10 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">Challenge</h3>
          <p className="text-slate-600 dark:text-slate-400">What problem were we solving?</p>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">Solution</h3>
          <p className="text-slate-600 dark:text-slate-400">A concise look at the core idea and approach.</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-medium text-slate-900 dark:text-slate-100">Method & Implementation</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Stack, frameworks, and how it fits together. We’ll detail architectures and decisions here.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-medium text-slate-900 dark:text-slate-100">Results & Performance</h2>
        <p className="text-slate-600 dark:text-slate-400">Outcomes, metrics, and performance notes.</p>
      </section>

      <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
        ← Back to Home
      </Link>
    </main>
  );
}


