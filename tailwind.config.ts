import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1a17",
        paper: "#f4efe4",
        crimson: { DEFAULT: "#a8281f", dark: "#861d16" },
        brass: "#9a7a3c",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "var(--font-devanagari)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        deva: ["var(--font-devanagari)", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
