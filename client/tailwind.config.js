/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Outfit'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        // Dark theme - deep space palette
        space: {
          950: "#090912",
          900: "#0d0d1a",
          850: "#11111f",
          800: "#161625",
          750: "#1a1a2e",
          700: "#1e1e3a",
          600: "#252545",
          500: "#2d2d5a",
        },
        accent: {
          purple: "#7c5cfc",
          blue: "#5c8dfc",
          cyan: "#5cfcf0",
          green: "#5cfca0",
          yellow: "#fcdc5c",
          red: "#fc5c5c",
          pink: "#fc5cdc",
        },
        text: {
          primary: "#e8e8f0",
          secondary: "#9898b8",
          muted: "#5c5c7a",
        }
      },
      animation: {
        "slide-in": "slideIn 0.2s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      },
    },
  },
  plugins: [],
};
