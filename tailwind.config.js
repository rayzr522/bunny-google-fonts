/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "selector",
  content: ["./index.html", "./src/**/*.{ts,vue}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar")],
};
