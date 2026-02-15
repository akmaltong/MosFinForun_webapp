/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        secondary: '#ff6b35',
        dark: '#1a1a2e',
        light: '#f8f9fa'
      }
    },
  },
  plugins: [],
}
