/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          deep: "#1a1a1a",
          surface: "#f5f5f5",
        },
        primary: {
          soft: "#e0f2f1",
          accent: "#b2dfdb",
        },
      },
      backgroundImage: {
        "rabbit-hole":
          "linear-gradient(to bottom, #e8f5e9 0%, #4a4a4a 40%, #2c2c2c 70%, #1a1a1a 100%)",
      },
    },
  },
  plugins: [],
};
