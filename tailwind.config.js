/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          50: '#fbf9f6',
          100: '#f5f1eb',
          200: '#ebe1d5',
          300: '#dccab6',
          400: '#c8ad91',
          500: '#b69271',
          600: '#a37b5b',
          700: '#856249',
          800: '#6c503e',
          900: '#584235',
          950: '#1a1816',
        },
        gold: {
          400: '#f3c969',
          500: '#dfa838',
          600: '#c28b23',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
