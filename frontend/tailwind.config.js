/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'crop-green': '#228B22',
        'crop-gold': '#FFD700',
        'crop-orange': '#FF8C00',
        'crop-brown': '#8B4513',
        'crop-blue': '#1E90FF'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
