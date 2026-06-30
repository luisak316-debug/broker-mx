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
        ink: {
          900: '#0b1120',
          800: '#111a2e',
          700: '#1a2540',
          600: '#26324f',
        },
        ok: '#16a34a',
        danger: '#dc2626',
      },
    },
  },
  plugins: [],
};
