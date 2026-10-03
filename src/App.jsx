import { lazy, Suspense, useCallback, useState } from "react";
import ParticlesBackground from "./components/ParticlesBackground.jsx";
import BootScreen from "./components/BootScreen.jsx";
import Hud from "./components/Hud.jsx";
import Hero from "./components/Hero.jsx";
import Experience from "./components/Experience.jsx";
import Projects from "./components/Projects.jsx";
import Leadership from "./components/Leadership.jsx";
import Awards from "./components/Awards.jsx";
import Skills from "./components/Skills.jsx";
import Contact from "./components/Contact.jsx";
import ResumeViewer from "./components/ResumeViewer.jsx";
import { useDesign, labEnabled, isEmbed, compareMode } from "./lab/design.js";
import useShortcuts from "./components/useShortcuts.js";

// Design Lab code is only loaded in local development, so it never ships
const LabPanel = import.meta.env.DEV ? lazy(() => import("./lab/LabPanel.jsx")) : null;
const Compare = import.meta.env.DEV ? lazy(() => import("./lab/Compare.jsx")) : null;

export default function App() {
  const [design, setDesign] = useDesign();
  // Bumping this remounts the intro so the lab can replay it
  const [introRun, setIntroRun] = useState(0);
  const toast = useShortcuts();
  const [resumeOpen, setResumeOpen] = useState(false);
  // The hero waits for the entrance overlay before it starts typing
  const [ready, setReady] = useState(false);
  const onBootDone = useCallback(() => setReady(true), []);
  // Plain clicks open the in-page viewer; cmd/ctrl-click still opens the PDF in a new tab
  const openResume = useCallback((e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    setResumeOpen(true);
  }, []);
  const closeResume = useCallback(() => setResumeOpen(false), []);

  if (compareMode) return <Suspense fallback={null}><Compare /></Suspense>;

  const showParticles = design.bg === "particles" || design.bg === "both";
  const showGrid = design.bg === "grid" || design.bg === "both";

  return (
    <>
      {showParticles && <ParticlesBackground />}
      {showGrid && <div className="bg-grid" aria-hidden="true" />}
      {design.scan === "on" && <div className="scanlines" aria-hidden="true" />}
      <BootScreen
        key={`${design.intro}-${introRun}`}
        variant={isEmbed ? "off" : design.intro}
        force={introRun > 0}
        onDone={onBootDone}
      />
      <Hud onResume={openResume} />
      <main className="mx-auto max-w-5xl px-5 sm:px-8">
        <Hero onResume={openResume} ready={ready} variant={design.hero} />
        <Experience />
        <Projects />
        <Leadership />
        <Awards />
        <Skills />
        <Contact onResume={openResume} />
      </main>
      <footer className="border-t-2 border-line py-8 text-center font-mono text-xs text-mute">
        <p>© {new Date().getFullYear()} David Antwi</p>
        <p className="mt-2 hidden sm:block">Tip: press 1 to 6 to jump between sections. There is also a cheat code.</p>
      </footer>
      {labEnabled && (
        <Suspense fallback={null}>
          <LabPanel design={design} set={setDesign} onReplayIntro={() => setIntroRun((n) => n + 1)} />
        </Suspense>
      )}
      {resumeOpen && <ResumeViewer onClose={closeResume} />}
      {toast && (
        <div className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-center">
          <div role="status" className="toast panel !border-gold px-5 py-3 font-mono text-xs text-gold">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
