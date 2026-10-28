import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Scene from "./Scenes.jsx";
import { useOnScreen } from "../lib/useOnScreen.js";

// Product replicas: real UIs rebuilt on fake data, loaded only when a card needs one
const replicaModules = import.meta.glob("../replicas/*.jsx");
const replicas = Object.fromEntries(
  Object.entries(replicaModules).map(([path, load]) => [path.split("/").pop().replace(".jsx", ""), lazy(load)])
);

/** Becomes true once the element comes within a screen of the viewport, and stays true */
function useNear(ref, skip) {
  const [near, setNear] = useState(skip);
  useEffect(() => {
    const el = ref.current;
    if (near || !el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, near]);
  return near;
}

/**
 * A project's cover inside a window frame: a screenshot, a muted loop, or a
 * code-drawn scene for work that has no public screen (agents, robots).
 */
export default function Media({ project, eager = false, full = false, badge = null }) {
  const ref = useRef(null);
  const onScreen = useOnScreen(ref);
  // Replica code (13 to 20 KB each) downloads only when its card is about to be seen
  const near = useNear(ref, full || eager);
  const video = useRef(null);
  const { cover = {} } = project;

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (onScreen) v.play().catch(() => {});
    else v.pause();
  }, [onScreen]);

  const host = cover.host || (project.live ? project.live.replace(/^https?:\/\//, "") : project.slug);

  return (
    <div ref={ref} className="media-frame">
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-line" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-line" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-line" aria-hidden="true" />
        <span className="ml-2 min-w-0 truncate font-mono text-[11px] text-mute">{host}</span>
        {badge && <span className="ml-auto shrink-0 pl-3">{badge}</span>}
      </div>
      {/* On cards the cover is a picture: inert, so its buttons can't be tabbed to or announced */}
      <div className="relative aspect-[16/10] overflow-hidden bg-black" inert={!full}>
        {cover.replica && replicas[cover.replica] && !near ? (
          cover.scene ? <Scene name={cover.scene} playing={false} /> : cover.img ? <img src={cover.img} alt="" className="h-full w-full object-cover object-top" /> : null
        ) : cover.replica && replicas[cover.replica] ? (
          <Suspense fallback={cover.scene ? <Scene name={cover.scene} playing={false} /> : null}>
            {(() => {
              const R = replicas[cover.replica];
              return <R mode={full ? "full" : "cover"} playing={onScreen} />;
            })()}
          </Suspense>
        ) : cover.video ? (
          <video
            ref={video}
            className="h-full w-full object-cover object-top"
            muted
            loop
            playsInline
            preload="metadata"
            poster={cover.img}
            aria-label={cover.alt}
          >
            <source src={cover.video} type="video/mp4" />
          </video>
        ) : cover.img ? (
          <img
            src={cover.img}
            alt={cover.alt || `${project.title} screenshot`}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        ) : cover.scene ? (
          <Scene name={cover.scene} playing={onScreen} />
        ) : null}
      </div>
    </div>
  );
}
