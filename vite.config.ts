import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/MosFinForun_webapp/',
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
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'zustand', 'react-merge-refs', 'tiny-invariant'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing', 'enhance-shader-lighting'],
          'ui-vendor': ['leva']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three'],
    exclude: ['model-viewer-4.1.0']
  }
})
