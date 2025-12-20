/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9', // لون سماوي يناسب السياحة
        secondary: '#0f172a', // لون داكن للنصوص
        accent: '#f59e0b', // لون برتقالي للأزرار والتركيز
      },
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'], // خط عربي مقترح (سنضيفه لاحقاً)
      }
    },
  },
  plugins: [],
}