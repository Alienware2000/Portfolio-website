/**
 * Atmosphere Component
 * Minimal digital world backdrop - subtle grid and depth
 * Creates sense of entering a digital space
 */
export default function Atmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 overflow-hidden">
      {/* Ultra-subtle vignette for depth */}
      <div className="absolute inset-0
                      bg-gradient-to-b from-transparent via-transparent to-black/1
                      dark:from-transparent dark:via-transparent dark:to-white/0.5" />
      
      {/* Minimal grid - digital world feel */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.015] dark:opacity-[0.02]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-300/50 dark:text-slate-700/50"/>
      </svg>

      {/* Single, very subtle radial depth */}
      <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2
                      rounded-full blur-3xl
                      bg-slate-100/5 dark:bg-slate-900/5" />
    </div>
  );
}
