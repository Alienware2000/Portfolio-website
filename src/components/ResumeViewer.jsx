import { useEffect } from "react";
import { Download, ExternalLink, X } from "lucide-react";
import { profile } from "../data/profile.js";

/** Full-screen resume reader: nothing to download, works on phones, Esc closes. */
export default function ResumeViewer({ onClose }) {
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Resume"
      className="fixed inset-0 z-50 flex flex-col bg-night/95"
      onClick={onClose}
    >
      <div
        className="flex items-center gap-3 border-b-2 border-line bg-panel px-4 py-2.5 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="label mr-auto !text-ink">Resume</p>
        <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="btn !px-3 !py-1.5">
          <ExternalLink size={14} aria-hidden="true" /> <span className="hidden sm:inline">Open</span> PDF
        </a>
        <a href={profile.resume} download className="btn !px-3 !py-1.5" aria-label="Download resume">
          <Download size={14} aria-hidden="true" /> <span className="hidden sm:inline">Download</span>
        </a>
        <button type="button" onClick={onClose} className="btn btn-primary !px-3 !py-1.5" autoFocus>
          <X size={14} aria-hidden="true" /> Close
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3 sm:p-8">
        <img
          src={profile.resumeImage}
          alt="David Antwi's resume. Use the Open PDF button for a text version."
          className="mx-auto w-full max-w-4xl border-2 border-line bg-white"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
