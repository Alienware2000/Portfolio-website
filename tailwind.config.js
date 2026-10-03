/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0a0a0c",
        panel: "#111114",
        raised: "#19191f",
        line: "#2a2a34",
        ink: "#f1f3f7",
        mute: "#9aa1b0",
        ember: "rgb(var(--ember) / <alpha-value>)",
        gold: "#ffd166",
        mint: "#5ef2b0",
      },
      fontFamily: {
        pixel: ["var(--font-display)"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
