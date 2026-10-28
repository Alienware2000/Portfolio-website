// Tracks whether a full-screen overlay (case study, resume, live preview) is open.
// The page behind it goes inert and the particle loop pauses until it closes.
let open = 0;

export function setOverlay(isOpen) {
  open = Math.max(0, open + (isOpen ? 1 : -1));
  document.documentElement.dataset.overlay = open ? "open" : "closed";
  window.dispatchEvent(new Event("overlaychange"));
}
