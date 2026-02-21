/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0E0E0E',
        surface: '#161616',
        border: '#262626',
        textPrimary: '#F5F5F5',
        textSecondary: '#A1A1AA',
        accent: '#C8A24C',
      }
    },
  },
  plugins: [],
}
