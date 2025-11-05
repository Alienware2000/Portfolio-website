/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Refined color palette with new personality
      colors: {
        // Light theme: fresh teal/emerald tones
        light: {
          bg: "rgb(250, 252, 253)",
          surface: "rgb(255, 255, 255)",
          text: "rgb(15, 23, 42)",
          textMuted: "rgb(71, 85, 105)",
          border: "rgb(226, 232, 240)",
          accent: "rgb(14, 165, 233)", // Sky blue
          accentHover: "rgb(2, 132, 199)", // Sky blue darker
          secondary: "rgb(16, 185, 129)", // Emerald
          tertiary: "rgb(139, 92, 246)", // Violet
        },
        // Dark theme: deep purple/blue tones
        dark: {
          bg: "rgb(9, 9, 11)",
          surface: "rgb(15, 15, 20)",
          text: "rgb(248, 250, 252)",
          textMuted: "rgb(148, 163, 184)",
          border: "rgb(39, 39, 42)",
          accent: "rgb(96, 165, 250)", // Blue
          accentHover: "rgb(147, 197, 253)", // Light blue
          secondary: "rgb(167, 139, 250)", // Violet
          tertiary: "rgb(251, 146, 60)", // Orange
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
