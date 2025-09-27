import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Enable source maps for production builds
  },
  server: {
    sourcemapIgnoreList: false, // Enable source maps in dev server
  },
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      process: "process/browser",
    },
  },
  optimizeDeps: {
    include: ['@excalidraw/excalidraw'],
  },
})
