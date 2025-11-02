// import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Navbar from "./components/Navbar.jsx";
import ProjectCard from "./components/ProjectCard.jsx";
import { projects } from "./data/projects.js";

export default function App() {
  return (
    <main className="mx-auto max-w-2xl px-5">
      {/* <Header /> */}
      <Navbar />
      <Hero />

      <hr className="mt-10 border-gray-200/70" />

      <section id="projects" className="mt-12">
        <h2 className="text-lg font-semibold">Projects</h2>
        <div className="mt-5 space-y-4">
            {projects.map(p => <ProjectCard key={p.title} {...p} />)}
        </div>
      </section>

      <hr className="mt-10 border-gray-200/70" />

      <section id="about" className="mt-14">
        <h2 className="text-lg font-semibold">About</h2>
        <p className="mt-3 text-gray-700 dark:text-gray-300">
            Short bio/About me goes here. Interests, tools, and what I’m learning.
        </p>
      </section>

      <hr className="mt-10 border-gray-200/70" />

      <section id="contact" className="mt-14 mb-16">
        <h2 className="text-lg font-semibold">Contact</h2>
        <p className="mt-3">
          <a className="text-indigo-600 hover:underline" href="https://github.com/Alienware2000" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span className="mx-2 text-gray-400">·</span>
          <a className="text-indigo-600 hover:underline" href="https://www.linkedin.com/in/david-antwi-b17727205/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </p>
      </section>

      

      <footer className="mt-10 pb-10 text-sm text-gray-500">
        <small>© {new Date().getFullYear()} David Antwi</small>
      </footer>
    </main>
  );
}
