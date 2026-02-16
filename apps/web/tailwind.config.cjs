/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#f6f7f9",
          raised: "#ffffff",
          muted: "#eef1f5"
        },
        ink: {
          DEFAULT: "#18202f",
          muted: "#667085",
          inverse: "#f8fafc"
        },
        signal: {
          blue: "#2563eb",
          teal: "#0f766e",
          amber: "#b7791f",
          red: "#dc2626",
          green: "#15803d"
        }
      },
      boxShadow: {
        panel: "0 1px 2px rgba(16, 24, 40, 0.06)"
      }
    }
  },
  plugins: []
};
