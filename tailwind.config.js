/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        obsidian: {
          DEFAULT: '#0A0B0E',
          surface: '#121419',
          elevated: '#1A1D24',
          border: '#252932',
        },
        alabaster: {
          DEFAULT: '#F7F7F5',
          surface: '#FFFFFF',
          elevated: '#F0F0EC',
          border: '#E4E4E0',
        },
      },
    },
  },
  plugins: [],
}
