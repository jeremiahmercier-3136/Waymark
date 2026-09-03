import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { port: 5179, proxy: { '/api': 'http://localhost:5119' } },
  test: { environment: 'jsdom', setupFiles: './src/test-setup.ts' },
})
