/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans:    ["'Outfit'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        space: {
          950: "#07070f",
          900: "#0d0d1a",
          850: "#10101e",
          800: "#141422",
          750: "#18182c",
          700: "#1e1e32",
          600: "#252540",
          500: "#2e2e50",
        },
        accent: {
          purple: "#B153D7",
          pink:   "#F375C2",
          blue:   "#B153D7",
          cyan:   "#F375C2",
          green:  "#5cfca0",
          yellow: "#fcdc5c",
          red:    "#fc5c5c",
        },
        text: {
          primary:   "#eeeef8",
          secondary: "#9898b8",
          muted:     "#55556e",
        }
      },
    },
  },
  plugins: [],
};