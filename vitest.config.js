import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",

    // Important: root frontend tests should only scan src
    include: ["src/**/*.{test,spec}.{js,jsx}"],

    // Important: do not run backend tests from root
    exclude: ["node_modules", "dist", "backend/**"],
  },
});
