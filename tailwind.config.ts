import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:      "#f7f5f0",
        surface: "#ffffff",
        border:  "#e8e4dc",
        ink:     "#1a1714",
        ink2:    "#4a4540",
        ink3:    "#8a8278",
        accent:  "#c17f3a",
        success: "#2d6a4f",
      },
      fontFamily: {
        serif: ["DM Serif Display", "serif"],
        sans:  ["DM Sans", "sans-serif"],
        mono:  ["DM Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "10px",
        lg: "16px",
        xl: "20px",
      },
    },
  },
  plugins: [],
};

export default config;