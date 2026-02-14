/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f2f7f4',
          100: '#e5eee9',
          200: '#ccdcd2',
          300: '#a3c1b1',
          400: '#719d85',
          500: '#4d7d64',
          600: '#3a614e',
          700: '#2d5a43', // Original green
          800: '#264134',
          900: '#1e3a2c',
        }
      }
    },
  },
  plugins: [],
}
