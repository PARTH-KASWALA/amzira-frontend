import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FDF8ED",
        sandal: "#F3E7CF",
        charcoal: "#171412",
        maroon: {
          DEFAULT: "#8F1438",
          deep: "#5C071C",
          soft: "#F9E9EF"
        },
        gold: {
          DEFAULT: "#A16207",
          bright: "#D4AF37",
          pale: "#F6E3A4"
        },
        peacock: "#0B4F6C",
        emerald: "#1B4D3E",
        lotus: "#C02664"
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 20, 18, 0.10)",
        sari: "0 24px 70px rgba(92, 7, 28, 0.16)"
      },
      backgroundImage: {
        "temple-border":
          "linear-gradient(135deg, rgba(161,98,7,.18) 25%, transparent 25%), linear-gradient(225deg, rgba(161,98,7,.18) 25%, transparent 25%)"
      }
    }
  },
  plugins: []
};

export default config;
