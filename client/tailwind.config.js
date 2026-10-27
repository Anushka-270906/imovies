/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        imovies: {
          red: '#E50914',
          darkRed: '#B81D24',
          crimson: '#DC2626',
          bg: '#0A0E17',
          surface: '#111827',
          card: '#161F30',
          cardHover: '#1C273C',
          border: '#222F46',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
