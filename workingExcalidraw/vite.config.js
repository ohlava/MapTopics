import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  define: {
    'process.env': {},
    'process.platform': JSON.stringify(process.platform),
    'process.version': JSON.stringify(process.version),
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
