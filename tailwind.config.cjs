/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--color-bg-surface)",
        panel: "var(--color-bg-panel)",
        sidebar: "var(--color-bg-sidebar)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        accentSoft: "var(--color-accent-soft)",
        ring: "var(--color-ring)",
        status: {
          success: "var(--color-status-success)",
          warning: "var(--color-status-warning)",
          danger: "var(--color-status-danger)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        valera: ["var(--font-valera)"],
      },
      borderRadius: {
        card: "var(--radius-card)",
        control: "var(--radius-control)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};
