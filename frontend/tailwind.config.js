/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0f172a", // Slate 900
          800: "#1e293b", // Slate 800
          700: "#334155", // Slate 700
          600: "#475569", // Slate 600
        },
        eco: {
          green: "#10b981", // Emerald 500
          teal: "#14b8a6", // Teal 500
          cyan: "#06b6d4", // Cyan 500
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
