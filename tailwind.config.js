/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf4f0',
          100: '#fbe4d8',
          200: '#f6c4a8',
          300: '#f09d70',
          400: '#e8713a',
          500: '#d95318',
          600: '#b83f10',
          700: '#93300e',
          800: '#752913',
          900: '#602414',
          950: '#350f06',
        },
        neutral: {
          50:  '#f9f8f7',
          100: '#f0eee9',
          200: '#dedad3',
          300: '#c4beb4',
          400: '#a89e91',
          500: '#8f8276',
          600: '#766b60',
          700: '#60564d',
          800: '#4e4540',
          900: '#433c38',
          950: '#231f1c',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgba(35,31,28,0.08), 0 1px 2px -1px rgba(35,31,28,0.06)',
        'card-md': '0 4px 16px -2px rgba(35,31,28,0.12), 0 2px 4px -2px rgba(35,31,28,0.08)',
        'card-lg': '0 10px 40px -4px rgba(35,31,28,0.16), 0 4px 8px -4px rgba(35,31,28,0.08)',
      },
    },
  },
  plugins: [],
}
