import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        board: "#1a2535",
        card: "#f5f0e8",
        gold: "#c9a84c",
        "gold-bright": "#ffd700",
        "suit-dark": "#1a1a2e",
        "suit-red": "#c0392b",
        "trump-glow": "#e74c3c",
        text: "#e8e8f0",
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        noto: ["Noto Serif KR", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        mighty: "0 0 20px #ffd700, 0 0 40px #ffd70066",
        trump: "0 0 12px #e74c3c, 0 0 24px #e74c3c66",
        card: "0 4px 16px rgba(0,0,0,0.5)",
        "card-hover": "0 12px 32px rgba(0,0,0,0.7)",
      },
      keyframes: {
        "mighty-glow": {
          "0%, 100%": { boxShadow: "0 0 12px #ffd700, 0 0 24px #ffd70055" },
          "50%": { boxShadow: "0 0 24px #ffd700, 0 0 48px #ffd700aa" },
        },
      },
      animation: {
        "mighty-glow": "mighty-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
