import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";

/** Runs a project's live site inside the portfolio, loaded only when opened. */
export default function PreviewModal({ project, onClose }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`${project.title} live preview`} className="fixed inset-0 z-50 flex flex-col bg-night/95 p-3 sm:p-6">
      <div className="panel flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b-2 border-line px-4 py-2.5">
          <span className="h-2 w-2 shrink-0 bg-mint" aria-hidden="true" />
          <p className="mr-auto min-w-0 truncate font-mono text-xs text-mute">
            <span className="text-ink">{project.title}</span> · {project.live.replace("https://", "")}
          </p>
          <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn !px-3 !py-1.5">
            <ExternalLink size={14} aria-hidden="true" /> <span className="hidden sm:inline">New tab</span>
          </a>
          <button type="button" onClick={onClose} className="btn btn-primary !px-3 !py-1.5" autoFocus>
            <X size={14} aria-hidden="true" /> Close
          </button>
        </div>
        <div className="relative min-h-0 flex-1 bg-black">
          {!loaded && <p className="blink absolute inset-0 grid place-items-center font-mono text-sm text-mute">Loading {project.title}...</p>}
          <iframe
            src={project.live}
            title={`${project.title} live site`}
            onLoad={() => setLoaded(true)}
            className="relative h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            allow="autoplay; fullscreen; gamepad"
          />
        </div>
      </div>
    </div>
  );
}
