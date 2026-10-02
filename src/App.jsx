import { useState } from 'react'
import DialoguePractice from './components/DialoguePractice.jsx'
import Notice, { codeClass } from './components/Notice.jsx'
import VietnameseCard from './components/VietnameseCard.jsx'
import { demoWords } from './data/phrases.js'
import { useVietnameseWords } from './hooks/useVietnameseWords.js'
import { TONES } from './lib/tones.js'

const TABS = [
  {
    id: 'cards',
    label: 'Карточки',
    title: 'В кафе и за едой',
    intro: 'Базовые фразы, чтобы поздороваться, заказать кофе и фо. Цвет подчёркивания показывает тон каждого слога.',
  },
  {
    id: 'practice',
    label: 'Практика',
    title: 'Микро-диалоги',
    intro: 'Выберите ситуацию и поговорите с носителем: 3–4 короткие реплики. Отвечайте кнопками-подсказками или своими словами — ошибки не страшны.',
  },
]

function CardsTab({ status, words, error }) {
  const cards = status === 'unconfigured' ? demoWords : words
  return (
    <>
      <section aria-label="Шесть тонов" className="mt-8 flex flex-wrap gap-2">
        {Object.values(TONES).map((t) => (
          <span
            key={t.name}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
            <span className="font-semibold" lang="vi">{t.example}</span>
            <span className="text-muted">{t.name} — {t.ru}</span>
          </span>
        ))}
      </section>

      {status === 'unconfigured' && (
        <Notice title="Supabase ещё не подключён — показаны демо-карточки">
          <p>
            1. Впишите <span className={codeClass}>VITE_SUPABASE_URL</span> и{' '}
            <span className={codeClass}>VITE_SUPABASE_ANON_KEY</span> в файл{' '}
            <span className={codeClass}>.env.local</span> (Supabase → Project Settings → API).
          </p>
          <p>
            2. Выполните <span className={codeClass}>supabase_schema.sql</span> в SQL Editor вашего проекта.
          </p>
          <p>
            3. Перезапустите <span className={codeClass}>npm run dev</span>.
          </p>
        </Notice>
      )}

      {status === 'error' && (
        <Notice tone="error" title="Не удалось загрузить фразы из Supabase">
          <p className="font-mono text-xs">{error.message}</p>
          {(error.code === '42P01' || error.code === 'PGRST205') && (
            <p>
              Таблицы <span className={codeClass}>vietnamese_words</span> нет — выполните{' '}
              <span className={codeClass}>supabase_schema.sql</span> в SQL Editor.
            </p>
          )}
        </Notice>
      )}

      {status === 'loading' && <p className="mt-10 text-muted">Загружаем фразы…</p>}

      {status === 'ready' && words.length === 0 && (
        <p className="mt-10 text-muted">
          Таблица пуста. Запустите <span className={codeClass}>supabase_schema.sql</span>, чтобы добавить
          начальные фразы.
        </p>
      )}

      {cards.length > 0 && (
        <main className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((word) => (
            <VietnameseCard key={word.id} {...word} />
          ))}
        </main>
      )}
    </>
  )
}

export default function App() {
  const [tabId, setTabId] = useState('cards')
  const wordsState = useVietnameseWords()
  const tab = TABS.find((t) => t.id === tabId)
  const words = wordsState.status === 'unconfigured' ? demoWords : wordsState.words

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-medium text-accent">Vietnamese Vibe ☕</p>
          <nav className="inline-flex rounded-full border border-line bg-white p-1 text-sm" aria-label="Разделы">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTabId(t.id)}
                aria-current={t.id === tabId ? 'page' : undefined}
                className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                  t.id === tabId ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">{tab.title}</h1>
        <p className="mt-3 max-w-xl text-muted">{tab.intro}</p>
      </header>

      {tabId === 'cards' ? <CardsTab {...wordsState} /> : <DialoguePractice words={words} />}
    </div>
  )
}
