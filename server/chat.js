// Серверная часть «Практики»: держит API-ключ ИИ у себя и собирает промпт сама.
// Используется и в Vercel-функции api/chat.js, и в dev-сервере Vite (vite.config.js).
// Клиент присылает только id ситуации и историю реплик — произвольный промпт подставить нельзя.
import { situations } from '../src/data/situations.js'
import { MAX_AI_TURNS, buildSystemPrompt, turnNote } from '../src/lib/dialogue.js'

const MAX_USER_CHARS = 300
const MAX_ASSISTANT_CHARS = 2000
const UPSTREAM_TIMEOUT_MS = 25_000

const PROVIDERS = {
  gemini: (env) => ({
    label: 'Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    apiKey: env.GEMINI_API_KEY,
    keyVar: 'GEMINI_API_KEY',
    // Бесплатные модели бывают перегружены (503) — тогда пробуем запасную
    models: [env.GEMINI_MODEL || 'gemini-3.5-flash', 'gemini-3.1-flash-lite'],
    // У Gemini 3 «размышления» не отключаются; 'low' поддерживают все Flash-модели
    extraBody: { reasoning_effort: 'low' },
    extraHeaders: {},
  }),
  openrouter: (env) => ({
    label: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: env.OPENROUTER_API_KEY,
    keyVar: 'OPENROUTER_API_KEY',
    models: [env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-5.5'],
    // Без этого модель тратит лимит токенов на скрытые «размышления» и ответ приходит пустым
    extraBody: { reasoning: { effort: 'minimal' } },
    extraHeaders: { 'X-Title': 'Vietnamese Vibe' },
  }),
}

function getProvider(env) {
  const provider = (PROVIDERS[env.AI_PROVIDER] ?? PROVIDERS.gemini)(env)
  const configured = Boolean(provider.apiKey) && !provider.apiKey.includes('your-')
  return { ...provider, configured }
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })

// История всегда начинается с реплики ИИ и чередуется: assistant, user, assistant, user...
// Перед запросом последней должна быть реплика пользователя (или история пуста — начало диалога).
function validateHistory(history) {
  if (!Array.isArray(history)) return 'history должен быть массивом'
  if (history.length % 2 !== 0) return 'история должна заканчиваться репликой пользователя'
  if (history.length >= MAX_AI_TURNS * 2) return 'диалог уже завершён'
  for (const [i, m] of history.entries()) {
    const role = i % 2 === 0 ? 'assistant' : 'user'
    const limit = role === 'user' ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS
    if (m?.role !== role || typeof m.content !== 'string' || !m.content.trim()) {
      return 'некорректная история диалога'
    }
    if (m.content.length > limit) return `реплика длиннее ${limit} символов`
  }
  return null
}

// Gemini отдаёт ошибку массивом [{ error }], OpenRouter — объектом { error }
function upstreamError(body) {
  const payload = Array.isArray(body) ? body[0] : body
  return payload?.error?.message
}

const RETRYABLE = new Set([429, 500, 503])

async function callModel(provider, messages) {
  let res
  for (const model of [...new Set(provider.models)]) {
    res = await fetch(provider.url, {
      method: 'POST',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        ...provider.extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        ...provider.extraBody,
      }),
    })
    if (!RETRYABLE.has(res.status)) break
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    if (res.status === 429) {
      return json({ error: `${provider.label}: превышен лимит бесплатных запросов, подождите минуту` }, 429)
    }
    if (res.status === 503) {
      return json({ error: `${provider.label}: модели сейчас перегружены, попробуйте через минуту` }, 503)
    }
    return json({ error: upstreamError(body) || `${provider.label} вернул ошибку HTTP ${res.status}` }, 502)
  }

  const data = await res.json()
  const choice = data.choices?.[0]
  const content = choice?.message?.content ?? ''
  if (choice?.finish_reason === 'length') {
    return json({ error: 'ответ модели оборвался из-за лимита токенов' }, 502)
  }
  if (!content.trim()) return json({ error: 'модель вернула пустой ответ' }, 502)
  return json({ content })
}

export async function handleChat(request, env) {
  const provider = getProvider(env)

  // GET — клиент узнаёт, настроен ли ИИ на сервере (без раскрытия ключа)
  if (request.method === 'GET') {
    return json({ configured: provider.configured, provider: provider.label, keyVar: provider.keyVar })
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!provider.configured) {
    return json({ error: `На сервере не задан ${provider.keyVar}` }, 500)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'некорректный JSON' }, 400)
  }

  const situation = situations.find((s) => s.id === body?.situationId)
  if (!situation) return json({ error: 'неизвестная ситуация' }, 400)

  const history = body.history ?? []
  const problem = validateHistory(history)
  if (problem) return json({ error: problem }, 400)

  const turn = history.length / 2 + 1
  const messages = [
    { role: 'system', content: buildSystemPrompt(situation) },
    ...history.map(({ role, content }) => ({ role, content })),
  ]
  if (history.length === 0) {
    messages.push({ role: 'user', content: 'Начни диалог.' + turnNote(turn) })
  } else {
    messages.at(-1).content += turnNote(turn)
  }

  try {
    return await callModel(provider, messages)
  } catch (e) {
    const timedOut = e.name === 'TimeoutError'
    return json({ error: timedOut ? 'ИИ не ответил вовремя, попробуйте ещё раз' : 'не удалось связаться с ИИ' }, 504)
  }
}
