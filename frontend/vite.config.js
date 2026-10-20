import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const enableBundleAnalysis = process.env.ANALYZE === "true";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(enableBundleAnalysis
      ? [
          visualizer({
            open: false,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],

  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },

  build: {
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: {
          reactvendor: [
            "react",
            "react-dom",
            "react-router-dom",
          ],

          pdf: ["pdfjs-dist"],
        },
      },
    },
  },
});