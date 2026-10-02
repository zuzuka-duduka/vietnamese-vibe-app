import { useState } from 'react'
import { TONES, detectTone, toneKeyByName } from '../lib/tones.js'
import { ToneSyllable } from './ToneText.jsx'

const CATEGORY_LABELS = {
  greetings: 'Приветствия',
  coffee: 'Кофе',
  food: 'Еда',
  shopping: 'Покупки',
}

export default function VietnameseCard({
  word_vi,
  tone_type,
  phonetic,
  translation_ru,
  pattern_sentence,
  category,
}) {
  const [open, setOpen] = useState(false)
  const syllables = word_vi.split(/\s+/)
  // Если тон в БД не распознан — берём тон первого слога
  const focusKey = toneKeyByName(tone_type) ?? detectTone(syllables[0])
  const focusTone = TONES[focusKey]
  const [sentenceVi, sentenceRu] = (pattern_sentence ?? '').split(' — ')

  return (
    <article className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: focusTone.color }}
          title="Ключевой тон фразы"
        >
          <span className="text-sm leading-none">{focusTone.mark}</span>
          {focusTone.name} · {focusTone.ru}
        </span>
        {category && (
          <span className="text-xs text-muted">{CATEGORY_LABELS[category] ?? category}</span>
        )}
      </div>

      <h2 className="mt-5 flex flex-wrap gap-x-3 gap-y-2 text-3xl font-semibold" lang="vi">
        {syllables.map((s, i) => (
          <ToneSyllable key={i} text={s} isFocus={detectTone(s) === focusKey} />
        ))}
      </h2>

      {phonetic && <p className="mt-4 text-sm text-muted">{phonetic}</p>}
      <p className="mt-1 text-lg">{translation_ru}</p>

      {sentenceVi && (
        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex w-full items-center justify-between rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-paper"
          >
            {open ? 'Скрыть пример' : 'Показать пример использования'}
            <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {open && (
            <div className="mt-4 rounded-xl bg-paper p-4 text-sm">
              <p className="text-base font-medium" lang="vi">{sentenceVi}</p>
              {sentenceRu && <p className="mt-1 text-muted">{sentenceRu}</p>}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
