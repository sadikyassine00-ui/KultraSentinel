import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0a0b1dff",
        surface: "#0F1522",
        "surface-elevated": "#141C2B",
        stroke: "#1E293B",
        "stroke-subtle": "rgba(30, 41, 59, 0.6)",
        "accent-amber": "#FF788D",
        accent: "#FF788D",
        "sentinel-green": "#10B981",
        "text-primary": "#FDF4D2",
        "text-subhead": "#fffae9ff",
        "text-muted": "#94A3B8",
        "text-subtle": "#64748B",
      },
      fontFamily: {
        satoshi: ["'Satoshi'", "sans-serif"],
        sans: ["'Satoshi'", "sans-serif"],
        display: ["'Satoshi'", "sans-serif"],
        mono: ["'Satoshi'", "sans-serif"],
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "5px",
        lg: "6px",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            background: "#0a0b1dff",
            foreground: "#FDF4D2",
            primary: {
              DEFAULT: "#FF788D",
              foreground: "#0a0b1dff",
            },
            focus: "#FF788D",
          },
        },
      },
    }),
  ],
};

export default config;
