import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@kubb/plugin-client/clients/fetch': path.resolve(
          __dirname,
          'src/api/kubbFetchClient.ts',
      ),
    },
  },
})