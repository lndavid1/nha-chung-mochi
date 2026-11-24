/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          ink: '#4A3525',
          sub: '#7D6352',
          bg: '#FFF8F0',
          card: '#FFFDF9',
          peach: '#FF9B71',
          peachDark: '#E87A4D',
          matcha: '#88C9A1',
          matchaDark: '#5EA87A',
          butter: '#FFE082',
          pink: '#FFB7C5',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FFF8F0',
          200: '#FFF0DE',
          300: '#FFE2C2',
        },
        peach: {
          400: '#FF9B71',
          500: '#F97316',
          600: '#EA580C',
        },
        mint: {
          200: '#CBEAD6',
          300: '#88C9A1',
          500: '#5EA87A',
        }
      },
      fontFamily: {
        sans: ['"Nunito"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
