import { useEffect, useMemo, useRef, useState } from 'react'
import { situations } from '../data/situations.js'
import { MAX_AI_TURNS, parseReply } from '../lib/dialogue.js'
import { fetchAiStatus, requestAiReply } from '../lib/ai.js'
import Notice, { codeClass } from './Notice.jsx'
import { ToneLegend, ToneText } from './ToneText.jsx'

function quickRepliesFor(situation, words) {
  // Порядок категорий в ситуации задаёт порядок подсказок: сначала тематические, потом общие
  const fromDb = situation.categories.flatMap((category) =>
    words.filter((w) => w.category === category).map((w) => w.word_vi),
  )
  return [...new Set(fromDb.length > 0 ? fromDb : situation.fallback)].slice(0, 8)
}

function SituationPicker({ onPick }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {situations.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onPick(s)}
          className="rounded-2xl border border-line bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-3xl">{s.emoji}</span>
          <p className="mt-3 font-semibold">{s.title}</p>
          <p className="mt-1 text-sm text-muted">{s.description}</p>
        </button>
      ))}
    </div>
  )
}

function AiBubble({ reply }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 shadow-sm">
        <p className="text-lg font-medium leading-relaxed">
          <ToneText text={reply.vi} />
        </p>
        {reply.phonetic && <p className="mt-1 text-sm text-muted">{reply.phonetic}</p>}
        {reply.ru && <p className="mt-0.5 text-sm">{reply.ru}</p>}
        <div className="mt-2">
          <ToneLegend text={reply.vi} />
        </div>
        {reply.tip && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">💡 {reply.tip}</p>
        )}
      </div>
    </div>
  )
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-white" lang="vi">
        {text}
      </p>
    </div>
  )
}

export default function DialoguePractice({ words }) {
  const [situation, setSituation] = useState(null)
  // { role: 'assistant', raw, reply } | { role: 'user', text }
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [input, setInput] = useState('')
  // { state: 'loading' | 'ready' | 'error', configured?, provider?, keyVar?, error? }
  const [aiStatus, setAiStatus] = useState({ state: 'loading' })
  const abortRef = useRef(null)
  const scrollRef = useRef(null)

  const quickReplies = useMemo(
    () => (situation ? quickRepliesFor(situation, words) : []),
    [situation, words],
  )
  const lastAi = [...messages].reverse().find((m) => m.role === 'assistant')
  const done = Boolean(lastAi?.reply.done)

  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    const controller = new AbortController()
    fetchAiStatus({ signal: controller.signal })
      .then((s) => setAiStatus({ state: 'ready', ...s }))
      .catch((e) => {
        if (e.name !== 'AbortError') setAiStatus({ state: 'error', error: e.message })
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  async function requestAiTurn(currentSituation, history) {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const turn = history.filter((m) => m.role === 'assistant').length + 1
    // Промпт собирает сервер — отправляем только ситуацию и сами реплики
    const apiHistory = history.map((m) =>
      m.role === 'assistant' ? { role: 'assistant', content: m.raw } : { role: 'user', content: m.text },
    )

    setLoading(true)
    setError(null)
    try {
      const raw = await requestAiReply(
        { situationId: currentSituation.id, history: apiHistory },
        { signal: controller.signal },
      )
      const reply = parseReply(raw)
      if (turn >= MAX_AI_TURNS) reply.done = true
      setMessages([...history, { role: 'assistant', raw, reply }])
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message)
    } finally {
      if (abortRef.current === controller) setLoading(false)
    }
  }

  function start(s) {
    setSituation(s)
    setMessages([])
    setInput('')
    requestAiTurn(s, [])
  }

  function send(text) {
    const value = text.trim()
    if (!value || loading || done) return
    const history = [...messages, { role: 'user', text: value }]
    setMessages(history)
    setInput('')
    requestAiTurn(situation, history)
  }

  function pickQuickReply(text) {
    // Шаблоны с «...» нужно дописать — кладём их в поле ввода
    if (text.includes('...')) setInput(text.replace('...', '').trimEnd() + ' ')
    else send(text)
  }

  function backToSituations() {
    abortRef.current?.abort()
    setLoading(false)
    setSituation(null)
    setMessages([])
    setError(null)
  }

  if (aiStatus.state === 'loading') {
    return <p className="mt-8 text-muted">Проверяем подключение ИИ…</p>
  }

  if (aiStatus.state === 'error') {
    return (
      <Notice tone="error" title="Сервер ИИ недоступен">
        <p className="font-mono text-xs">{aiStatus.error}</p>
      </Notice>
    )
  }

  if (!aiStatus.configured) {
    return (
      <Notice title={`ИИ-собеседник (${aiStatus.provider}) ещё не подключён`}>
        <p>
          Локально: впишите ключ в <span className={codeClass}>{aiStatus.keyVar}</span> в файле{' '}
          <span className={codeClass}>.env.local</span> и перезапустите{' '}
          <span className={codeClass}>npm run dev</span>.
        </p>
        <p>
          На Vercel: добавьте <span className={codeClass}>{aiStatus.keyVar}</span> в Settings → Environment
          Variables и сделайте Redeploy.
        </p>
      </Notice>
    )
  }

  if (!situation) return <SituationPicker onPick={start} />

  return (
    <section className="mt-8 flex flex-col rounded-2xl border border-line bg-paper">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <p className="font-semibold">
          {situation.emoji} {situation.title}
        </p>
        <button type="button" onClick={backToSituations} className="text-sm text-accent hover:underline">
          ← Другая ситуация
        </button>
      </div>

      <div ref={scrollRef} className="flex h-[26rem] flex-col gap-3 overflow-y-auto px-5 py-4">
        {messages.map((m, i) =>
          m.role === 'assistant' ? <AiBubble key={i} reply={m.reply} /> : <UserBubble key={i} text={m.text} />,
        )}
        {loading && (
          <div className="flex justify-start">
            <span className="animate-pulse rounded-2xl border border-line bg-white px-4 py-2 text-muted">
              печатает…
            </span>
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            <p>Не удалось получить ответ: {error}</p>
            <button
              type="button"
              onClick={() => requestAiTurn(situation, messages)}
              className="mt-2 font-medium underline"
            >
              Повторить
            </button>
          </div>
        )}
        {done && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="text-muted">Диалог завершён 🎉</span>
            <button type="button" onClick={() => start(situation)} className="font-medium text-accent hover:underline">
              Ещё раз
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((text) => (
            <button
              key={text}
              type="button"
              disabled={loading || done}
              onClick={() => pickQuickReply(text)}
              className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
              lang="vi"
            >
              {text}
            </button>
          ))}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={done}
            maxLength={300}
            placeholder={done ? 'Диалог завершён' : 'Ответьте по-вьетнамски…'}
            className="min-w-0 flex-1 rounded-xl border border-line px-4 py-2.5 outline-none focus:border-accent disabled:bg-paper"
            lang="vi"
          />
          <button
            type="submit"
            disabled={loading || done || !input.trim()}
            className="rounded-xl bg-accent px-5 py-2.5 font-medium text-white transition-opacity disabled:opacity-40"
          >
            Отправить
          </button>
        </form>
      </div>
    </section>
  )
}
