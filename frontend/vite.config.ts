import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/anagrafica/',
  server: {
    proxy: {
      '/anagrafica/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
