import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/utils/feature_extractor.js'],
    },
  },
  server: {
    https: true,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ml': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision']
  }
})