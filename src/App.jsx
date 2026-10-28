import { lazy, Suspense, useCallback, useState } from "react";
import ParticlesBackground from "./components/ParticlesBackground.jsx";
import BootScreen from "./components/BootScreen.jsx";
import Hud from "./components/Hud.jsx";
import Hero from "./components/Hero.jsx";
import Experience from "./components/Experience.jsx";
import Work from "./components/Work.jsx";
import Log from "./components/Log.jsx";
import Archive from "./components/Archive.jsx";
import CaseStudy from "./components/CaseStudy.jsx";
import Leadership from "./components/Leadership.jsx";
import Awards from "./components/Awards.jsx";
import Skills from "./components/Skills.jsx";
import Contact from "./components/Contact.jsx";
import ResumeViewer from "./components/ResumeViewer.jsx";
import { useDesign, labEnabled, isEmbed, compareMode } from "./lab/design.js";
import useShortcuts from "./components/useShortcuts.js";
import { caseStudies } from "./data/profile.js";
import { navigate, usePath, workSlug } from "./lib/route.js";

// Someone opening a shared /work/<slug> link should land on the project, not the intro
const deepLinked = workSlug(window.location.pathname) !== null;

// Design Lab code is only loaded in local development, so it never ships
const LabPanel = import.meta.env.DEV ? lazy(() => import("./lab/LabPanel.jsx")) : null;
const Compare = import.meta.env.DEV ? lazy(() => import("./lab/Compare.jsx")) : null;
const ReplicaBench = import.meta.env.DEV ? lazy(() => import("./lab/ReplicaBench.jsx")) : null;
const benchMode = import.meta.env.DEV && window.location.pathname === "/lab/replica";
const OgCard = import.meta.env.DEV ? lazy(() => import("./lab/OgCard.jsx")) : null;
const ogMode = import.meta.env.DEV && window.location.pathname === "/lab/og";

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
  const path = usePath();
  const slug = workSlug(path);
  const caseIndex = caseStudies.findIndex((p) => p.slug === slug);
  const behindOverlay = caseIndex >= 0 || resumeOpen;
  const closeCase = useCallback(() => {
    // Came from the page: go back so scroll position is kept. Came from a shared link: go home.
    if (window.history.state?.fromSite) window.history.back();
    else navigate("/", { replace: true });
  }, []);

  if (compareMode) return <Suspense fallback={null}><Compare /></Suspense>;
  if (benchMode) return <Suspense fallback={null}><ReplicaBench /></Suspense>;
  if (ogMode) return <Suspense fallback={null}><OgCard /></Suspense>;

  const showParticles = design.bg === "particles" || design.bg === "both";
  const showGrid = design.bg === "grid" || design.bg === "both";

  return (
    <>
      {showParticles && <ParticlesBackground />}
      {showParticles && <div className="particle-dim" aria-hidden="true" />}
      {showGrid && <div className="bg-grid" aria-hidden="true" />}
      {design.scan === "on" && <div className="scanlines" aria-hidden="true" />}
      <BootScreen
        key={`${design.intro}-${introRun}`}
        variant={isEmbed || deepLinked ? "off" : design.intro}
        force={introRun > 0}
        onDone={onBootDone}
      />
      <Hud onResume={openResume} inert={behindOverlay} />
      <main className="mx-auto max-w-5xl px-5 sm:px-8" inert={behindOverlay}>
        <Hero onResume={openResume} ready={ready} variant={design.hero} />
        <Work />
        <Log />
        <Experience />
        <Archive />
        <Leadership />
        <Awards />
        <Skills />
        <Contact onResume={openResume} />
      </main>
      <footer className="border-t-2 border-line py-8 text-center font-mono text-xs text-mute" inert={behindOverlay}>
        <p>© {new Date().getFullYear()} David Antwi</p>
        <p className="mt-2 hidden sm:block">Tip: press 1 to 7 to jump between sections. There is also a cheat code.</p>
        <p className="mt-2">
          AI agent? Read <a href="/llms.txt" className="text-ember hover:text-gold">llms.txt</a> or everything at once in{" "}
          <a href="/llms-full.txt" className="text-ember hover:text-gold">llms-full.txt</a>.
        </p>
      </footer>
      {labEnabled && (
        <Suspense fallback={null}>
          <LabPanel design={design} set={setDesign} onReplayIntro={() => setIntroRun((n) => n + 1)} />
        </Suspense>
      )}
      {resumeOpen && <ResumeViewer onClose={closeResume} />}
      {caseIndex >= 0 && (
        <CaseStudy
          project={caseStudies[caseIndex]}
          prev={caseStudies[caseIndex - 1]}
          next={caseStudies[caseIndex + 1]}
          onClose={closeCase}
        />
      )}
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
