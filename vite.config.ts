import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Allows access from outside the container
    port: mode === 'development' ? 5173 : 8080,
    watch: {
      usePolling: true, // Enable polling for better file watching
      interval: 1000, // Check for changes every second
    },
    hmr: {
      clientPort: mode === 'development' ? 5173 : undefined, // HMR port
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
