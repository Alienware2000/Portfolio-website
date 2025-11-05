/**
 * Atmosphere Component
 * Living, breathing background with subtle depth and ambient lighting
 * Creates immersive atmosphere without distraction
 */
export default function Atmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 overflow-hidden">
      {/* Soft vignette - warm for light, cool for dark */}
      <div className="absolute inset-0
                      bg-gradient-to-b from-transparent via-transparent to-black/3
                      dark:from-transparent dark:via-transparent dark:to-white/2" />
      
      {/* Radial depth overlay */}
      <div className="absolute inset-0
                      bg-gradient-to-b from-transparent via-transparent to-black/2
                      dark:from-transparent dark:via-transparent dark:to-white/1" />

      {/* Primary ambient glow - breathing, subtle */}
      <div className="absolute left-1/2 top-1/4 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-3xl
                      bg-gradient-to-br from-sky-300/6 via-emerald-300/4 to-teal-300/3
                      dark:from-blue-600/8 dark:via-violet-600/6 dark:to-indigo-600/4
                      animate-breathe" />

      {/* Secondary ambient accent */}
      <div className="absolute right-1/4 top-1/2 h-80 w-80 rounded-full blur-3xl
                      bg-amber-200/3 dark:bg-blue-500/4
                      animate-breathe"
           style={{ animationDelay: '2s' }} />

      {/* Tertiary subtle glow */}
      <div className="absolute left-1/4 bottom-1/4 h-96 w-96 rounded-full blur-3xl
                      bg-cyan-200/2 dark:bg-indigo-500/3
                      animate-breathe"
           style={{ animationDelay: '4s' }} />

      {/* Extremely subtle grid - almost imperceptible */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.015] dark:opacity-[0.02]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-400 dark:text-slate-600"/>
      </svg>
    </div>
  );
}
