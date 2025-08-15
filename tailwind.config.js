/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hubspot-orange': '#ff7a59',
        'hubspot-navy': '#2d3e50',
        'hubspot-gray': '#7c98b6',
        'hubspot-light': '#f5f8fa',
        'hubspot-dark': '#33475b',
      },
      fontFamily: {
        'sans': ['Lexend', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

