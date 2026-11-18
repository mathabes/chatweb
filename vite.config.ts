import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Proxy para evitar CORS no dev:
 * - Front chama /v1/... (mesma origin do Vite)
 * - Vite encaminha para o backend em http://127.0.0.1:8008
 */
// 127.0.0.1 evita que localhost resolva para ::1 quando a API escuta apenas em IPv4.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const testToken = env.CHATWEB_TEST_TOKEN?.trim()
  const testHeaders: Record<string, string> = testToken ? { Authorization: `Bearer ${testToken}` } : {}
  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      proxy: {
        '/v1/messages/zibb-teste/': {
          target: 'http://127.0.0.1:8008',
          changeOrigin: true,
          secure: false,
          headers: testHeaders,
        },
        '/v1': {
          target: 'http://127.0.0.1:8008',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

