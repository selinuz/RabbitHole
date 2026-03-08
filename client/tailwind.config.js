/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        accent: "var(--color-accent)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
      },
      backgroundImage: {
        "rabbit-hole":
          "linear-gradient(to bottom, #e8f5e9 0%, #4a4a4a 40%, #2c2c2c 70%, #1a1a1a 100%)",
      },
    },
  },
  plugins: [],
};
