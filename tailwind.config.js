/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        laliga: {
          red: '#ff004b',
          dark: '#0b0e17',
          card: '#141a29',
          border: '#222b40',
          hover: '#1b2336'
        }
      }
    },
  },
  plugins: [],
}
