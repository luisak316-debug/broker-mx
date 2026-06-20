/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          400: '#4f9cff',
          500: '#1f7aff',
          600: '#0b5fe0',
          700: '#0a4cb3',
        },
        ink: {
          900: '#0b1120',
          800: '#111a2e',
          700: '#1a2540',
          600: '#26324f',
        },
        bull: '#16a34a',
        bear: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
