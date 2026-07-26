/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          100: '#d9eaff',
          400: '#4f9cff',
          500: '#1f7aff',
          600: '#0b5fe0',
        },
        ok: '#fbbf24',
        warn: '#d97706',
        danger: '#dc2626',
      },
    },
  },
  plugins: [],
};
