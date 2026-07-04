import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev proxy: client fetch('/api/...') → Express on :3001 (avoids CORS).
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
