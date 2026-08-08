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
        ivory: "#FDFBF7",
        sandal: "#F4EFE6",
        charcoal: "#1A1A1A",
        maroon: {
          DEFAULT: "#9A1750",
          deep: "#700018",
          soft: "#FBF0F4"
        },
        gold: {
          DEFAULT: "#D4AF37",
          bright: "#D4AF37",
          pale: "#F8E7A5"
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
