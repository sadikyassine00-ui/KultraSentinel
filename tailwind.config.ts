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
        // Base
        canvas: "#0a0b0d",
        surface: "#0e0f11",
        "surface-2": "#131418",
        hairline: "rgba(255, 255, 255, 0.08)",
        "hairline-strong": "rgba(255, 255, 255, 0.14)",

        // Ghost (dormant / inactive / "before")
        ghost: {
          text: "#6b7078",
          dim: "#45484f",
          line: "#3a3d43",
          heading: "#cfcdc8",
        },

        // Signal (active / live / "after") — THE accent
        signal: {
          DEFAULT: "#f2a93b",
          dim: "#7a5a26",
          glow: "rgba(242, 169, 59, 0.35)",
          wash: "rgba(242, 169, 59, 0.06)",
        },

        // Content on dark
        ink: {
          primary: "#f4f1ea",
          secondary: "#b9b3a5",
        },

        // Semantic
        danger: {
          DEFAULT: "#d64545",
          wash: "rgba(214, 69, 69, 0.08)",
        },

        // Paper
        paper: "#f4f1ea",
        "paper-ink": "#111214",

        // Backward compatibility mappings for legacy classes
        "accent-amber": "#f2a93b",
        accent: "#f2a93b",
        "sentinel-green": "#f2a93b",
        "text-primary": "#f4f1ea",
        "text-subhead": "#b9b3a5",
        "text-muted": "#6b7078",
        "text-subtle": "#45484f",
        stroke: "rgba(255, 255, 255, 0.08)",
        "stroke-subtle": "rgba(255, 255, 255, 0.05)",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        body: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'Roboto Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "3px",
        sm: "3px",
        md: "4px",
        lg: "4px",
        xl: "4px",
        "2xl": "4px",
        pill: "100px",
        full: "100px",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
