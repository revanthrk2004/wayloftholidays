import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
theme: {
    extend: {
      zIndex: {
        9999: "9999",
      },
    },
  },

  plugins: [],
} satisfies Config;
