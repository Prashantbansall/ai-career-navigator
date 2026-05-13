import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("react-router") || id.includes("react-router-dom")) {
            return "vendor-router";
          }

          if (id.includes("react") || id.includes("react-dom")) {
            return "vendor-react";
          }

          if (id.includes("framer-motion")) {
            return "vendor-motion";
          }

          if (id.includes("lucide-react")) {
            return "vendor-icons";
          }

          if (id.includes("jspdf") || id.includes("html2canvas-pro")) {
            return "vendor-pdf";
          }

          return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
  },
});
