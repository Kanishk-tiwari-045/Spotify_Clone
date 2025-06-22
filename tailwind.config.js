/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'spotify-black': '#191414',
        'spotify-gray': '#121212',
        'spotify-light-gray': '#282828',
        'spotify-white': '#FFFFFF',
        'spotify-text-gray': '#B3B3B3',
      },
      fontFamily: {
        'spotify': ['Circular', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(180px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(200px, 1fr))',
      }
    },
  },
}
