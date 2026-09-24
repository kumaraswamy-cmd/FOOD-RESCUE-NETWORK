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
        navy: {
          950: '#0A1628',
          900: '#0D1E36',
          800: '#132B50',
          700: '#1C3B64',
          600: '#264D7E',
        },
        brandGreen: {
          50: '#F0FAF5',
          100: '#E0F7ED',
          500: '#00A86B',
          600: '#00965E',
          700: '#007D4E',
        }
      }
    },
  },
  plugins: [],
}
