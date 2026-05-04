import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      '/api/lieferando': {
        target: 'https://cw-api.takeaway.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/lieferando/, ''),
        headers: {
          'X-Country-Code': 'de',
          'X-Language-Code': 'de',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)',
          'Referer': 'https://www.lieferando.de/',
        },
      },
    },
  },
})