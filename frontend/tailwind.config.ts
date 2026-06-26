import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5fae7",
          100: "#e9f5cb",
          200: "#d4e997",
          300: "#b8d969",
          400: "#a7cc53",
          500: "#9fcb5c",
          600: "#7da343",
          700: "#607e33",
          800: "#485d28",
          900: "#313f1d"
        }
      },
      boxShadow: {
        glow: "0 10px 35px rgba(159, 203, 92, 0.25)",
        panel: "0 10px 40px rgba(0, 0, 0, 0.35)"
      },
      backgroundImage: {
        "radial-brand": "radial-gradient(circle at 20% 20%, rgba(159,203,92,0.2), transparent 35%), radial-gradient(circle at 80% 0%, rgba(117,142,255,0.16), transparent 40%), radial-gradient(circle at 50% 80%, rgba(236,93,129,0.14), transparent 35%)"
      }
    }
  },
  plugins: []
};

export default config;
