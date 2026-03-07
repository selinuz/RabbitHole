/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          deep: '#1a1a1a',
          surface: '#f5f5f5',
        },
        primary: {
          soft: '#e0f2f1',
          accent: '#b2dfdb',
        }
      },
      backgroundImage: {
        'rabbit-hole': 'linear-gradient(to bottom, #1a1a1a 0%, #2c2c2c 30%, #4a4a4a 60%, #e0f2f1 100%)',
      }
    },
  },
  plugins: [],
}
