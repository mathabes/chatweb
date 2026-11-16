import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Proxy para evitar CORS no dev:
 * - Front chama /v1/... (mesma origin do Vite)
 * - Vite encaminha para o backend em http://127.0.0.1:8008
 */
// 127.0.0.1 evita que localhost resolva para ::1 quando a API escuta apenas em IPv4.
const backendTarget = 'http://127.0.0.1:8008'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/v1': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

