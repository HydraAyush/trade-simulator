/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'price-up': 'price-up 1s ease-in-out',
        'price-down': 'price-down 1s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
      },
      keyframes: {
        'price-up': {
          '0%, 100%': { color: 'inherit' },
          '50%': { color: '#059669' }, // text-green-600
        },
        'price-down': {
          '0%, 100%': { color: 'inherit' },
          '50%': { color: '#DC2626' }, // text-red-600
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} 