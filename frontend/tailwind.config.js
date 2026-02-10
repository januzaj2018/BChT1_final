/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './node_modules/@material-tailwind/html/components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@material-tailwind/html/theme/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
