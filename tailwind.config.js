/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: {
          650: "#4B5563",
        },
      },
      animation: {
        in: "fadeIn 0.2s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "zoom-in-95": "zoomIn95 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        zoomIn95: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
// 這個專案是一個小工具

// 目標是能讓使用者一次領取多個帳號的 gift code

// 首先來設計介面，帳號
