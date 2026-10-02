import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleChat } from './server/chat.js'

// В dev-режиме обслуживаем /api/chat тем же кодом, что и Vercel-функция api/chat.js.
// loadEnv(..., '') читает и переменные без префикса VITE_ — они остаются на сервере.
function apiDevServer() {
  let env = {}
  return {
    name: 'api-dev-server',
    configResolved(config) {
      env = { ...loadEnv(config.mode, config.root, ''), ...process.env }
    },
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const request = new Request(`http://localhost${req.originalUrl}`, {
          method: req.method,
          headers: { 'Content-Type': req.headers['content-type'] ?? 'application/json' },
          body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
        })
        const response = await handleChat(request, env)
        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(await response.text())
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevServer()],
})
