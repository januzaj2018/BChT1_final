/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-green': '#10B981',
        'eco-dark': '#064E3B',
        'eco-light': '#D1FAE5',
      }
    },
  },
  plugins: [],
}
