/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'fade-in-out': {
          '0%':   { opacity: '0', transform: 'translate(-50%, -6px)' },
          '15%':  { opacity: '1', transform: 'translate(-50%, 0)' },
          '75%':  { opacity: '1', transform: 'translate(-50%, 0)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -4px)' },
        },
      },
      animation: {
        'fade-in-out': 'fade-in-out 1.6s ease forwards',
      },
    },
  },
  plugins: [],
};
