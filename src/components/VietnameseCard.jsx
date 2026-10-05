import { useState } from 'react'
import { categoryInfo } from '../data/categories.js'
import { TONES, detectTone, toneKeyByName } from '../lib/tones.js'
import SpeakButton from './SpeakButton.jsx'
import AgePronounNote from './AgePronounNote.jsx'
import { ToneSyllable, ToneText } from './ToneText.jsx'

// Кофе живёт внутри «Еды и напитков», но на карточке полезно видеть, что это именно кофе
const CARD_LABEL_OVERRIDES = { coffee: 'Кофе' }
const cardLabel = (category) => CARD_LABEL_OVERRIDES[category] ?? categoryInfo(category).title

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
          <span className="text-right text-xs text-muted">{cardLabel(category)}</span>
        )}
      </div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <h2 className="flex flex-wrap gap-x-3 gap-y-2 text-3xl font-semibold" lang="vi">
          {syllables.map((s, i) => (
            <ToneSyllable key={i} text={s} isFocus={detectTone(s) === focusKey} />
          ))}
        </h2>
        <SpeakButton text={word_vi} label="Прослушать фразу" />
      </div>

      <AgePronounNote text={word_vi} />

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
            <div className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-paper p-4 text-sm">
              <div>
                <p className="text-base font-medium">
                  <ToneText text={sentenceVi} tones={false} />
                </p>
                {sentenceRu && <p className="mt-1 text-muted">{sentenceRu}</p>}
                <AgePronounNote text={sentenceVi} />
              </div>
              <SpeakButton text={sentenceVi} label="Прослушать пример" size="sm" onPaper />
            </div>
          )}
        </div>
      )}
    </article>
  )
}
