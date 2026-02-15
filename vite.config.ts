import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    fs: {
      // Exclude model-viewer folder from serving
      deny: ['**/model-viewer-4.1.0/**']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['three'],
    exclude: ['model-viewer-4.1.0']
  }
})
