/**
 * Atmosphere Component
 * Theme-aware background with soft vignette, gradient lighting, and subtle grid pattern
 * Creates depth and visual interest without being distracting
 */
export default function Atmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 overflow-hidden">
      {/* Enhanced base vignette with smoother gradient */}
      <div className="absolute inset-0
                      bg-gradient-to-b from-transparent via-transparent to-black/8
                      dark:from-transparent dark:via-transparent dark:to-white/5" />
      
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0
                      bg-gradient-to-b from-transparent via-transparent to-black/5
                      dark:from-transparent dark:via-transparent dark:to-white/3" />

      {/* Faint radial haze behind hero area with new color scheme */}
      <div className="absolute left-1/2 top-28 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full blur-3xl
                      bg-gradient-to-br from-sky-400/8 via-emerald-400/5 to-teal-400/4
                      dark:from-blue-500/12 dark:via-violet-500/8 dark:to-indigo-500/6
                      animate-gradient" />

      {/* Secondary accent glow */}
      <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full blur-2xl
                      bg-cyan-400/4 dark:bg-blue-400/6" />

      {/* Subtle grid lines with refined opacity for both themes */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-gray-700 dark:text-gray-300"/>
      </svg>
    </div>
  );
}
