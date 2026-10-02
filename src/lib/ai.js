// Клиент ИИ-собеседника. Сам ключ хранится на сервере (server/chat.js),
// браузер ходит только в /api/chat: на Vercel это функция api/chat.js, локально — middleware Vite.

async function readJson(res) {
  return res.json().catch(() => null)
}

// { configured, provider, keyVar }
export async function fetchAiStatus({ signal } = {}) {
  const res = await fetch('/api/chat', { signal })
  const data = await readJson(res)
  if (!res.ok || !data) throw new Error(data?.error || `сервер ответил HTTP ${res.status}`)
  return data
}

// history — [{ role: 'assistant' | 'user', content }], начинается с реплики ИИ
export async function requestAiReply({ situationId, history }, { signal } = {}) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situationId, history }),
  })
  const data = await readJson(res)
  if (!res.ok) throw new Error(data?.error || `сервер ответил HTTP ${res.status}`)
  return data.content
}
