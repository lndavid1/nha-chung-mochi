/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF9',
          100: '#FFF9F2',
          200: '#FFF0DE',
          300: '#FFE2C2',
        },
        peach: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        },
        mint: {
          200: '#BBF7D0',
          300: '#86EFAC',
          500: '#22C55E',
        }
      },
      fontFamily: {
        sans: ['"Nunito"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'breathe': 'breathe 2.6s ease-in-out infinite',
        'wiggle': 'wiggle 1.2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 2s infinite',
        'twinkle': 'twinkle 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1, 1) translateY(0px)' },
          '50%': { transform: 'scale(1.03, 0.97) translateY(2px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: 0.3, transform: 'scale(0.9)' },
          '50%': { opacity: 1, transform: 'scale(1.15)' },
        }
      }
    },
  },
  plugins: [],
}
