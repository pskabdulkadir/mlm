import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    hmr: mode === "production" ? false : { host: "localhost", port: 3000 },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./client") },
      { find: "@shared", replacement: path.resolve(__dirname, "./shared") },
      {
        find: /^date-fns\/locale(\/.*)?$/,
        replacement: path.resolve(__dirname, "./node_modules/date-fns/locale.js"),
      },
      {
        find: /^date-fns(\/.*)?$/,
        replacement: path.resolve(__dirname, "./node_modules/date-fns/index.js"),
      },
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
}));
