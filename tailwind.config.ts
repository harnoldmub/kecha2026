import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FAF9F6", // Luxury Off-white / Ivory
        foreground: "#1A1A1A", // Near black for text
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
        primary: {
          DEFAULT: "#D4AF37", // Elegant Gold
          foreground: "#FAF9F6",
        },
        secondary: {
          DEFAULT: "#F5F5DC", // Soft Beige
          foreground: "#1A1A1A",
        },
        muted: {
          DEFAULT: "#F8F8F8",
          foreground: "#666666",
        },
        accent: {
          DEFAULT: "#E5D3B3", // Light Gold/Tan
          foreground: "#1A1A1A",
        },
        border: "#E2E2E2",
        input: "#F2F2F2",
        ring: "#D4AF37",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "'Playfair Display'", "serif"],
        script: ["'Great Vibes'", "cursive"],
        sans: ["'Lato'", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out forwards",
        "slide-up": "slideUp 0.8s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [animate],
} satisfies Config;
