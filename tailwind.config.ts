import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-bg)",
        panel: "var(--color-surface)",
        line: "var(--color-border)",
        mint: "var(--color-accent)",
        sky: "#7CC7FF",
        coral: "#FF8A7A"
      },
      boxShadow: {
        glow: "0 0 38px rgba(45, 212, 191, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
