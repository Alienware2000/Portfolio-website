/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Professional dual-theme palette
      colors: {
        // Light theme: Daylight / Creative - warm, airy, welcoming
        light: {
          bg: "rgb(252, 252, 251)", // Gentle off-white
          surface: "rgb(255, 255, 255)",
          text: "rgb(30, 41, 59)", // Not pure black
          textMuted: "rgb(100, 116, 139)",
          border: "rgb(226, 232, 240)",
          accent: "rgb(59, 130, 246)", // Pastel blue
          accentHover: "rgb(37, 99, 235)",
        },
        // Dark theme: Studio / Engineer - sleek, focused, low-distraction
        dark: {
          bg: "rgb(10, 10, 12)", // Matte dark
          surface: "rgb(15, 15, 18)",
          text: "rgb(241, 245, 249)", // Not pure white
          textMuted: "rgb(148, 163, 184)",
          border: "rgb(39, 39, 42)",
          accent: "rgb(56, 189, 248)", // Electric blue
          accentHover: "rgb(96, 165, 250)",
        },
      },
      // Enhanced typography scale
      fontSize: {
        "display": ["clamp(2.5rem, 5vw, 4rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "title": ["clamp(1.5rem, 3vw, 2rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
      },
      // Smooth, natural transitions
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "smooth-in": "cubic-bezier(0.4, 0, 1, 1)",
        "smooth-out": "cubic-bezier(0, 0, 0.2, 1)",
        "natural": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      // Gradient utilities
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
