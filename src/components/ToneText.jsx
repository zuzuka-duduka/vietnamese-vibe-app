import { AGE_PRONOUNS, splitWithPronouns } from '../lib/pronouns.js'
import { TONES, detectTone } from '../lib/tones.js'

const hasLetters = (s) => /\p{L}/u.test(s)

// Крупный слог с цветным подчёркиванием и подписью тона — для карточек
export function ToneSyllable({ text, isFocus = true }) {
  const tone = TONES[detectTone(text)]
  return (
    <span className="inline-flex flex-col items-center">
      <span
        className={`border-b-4 pb-0.5 transition-opacity ${isFocus ? '' : 'opacity-60'}`}
        style={{ borderColor: tone.color }}
      >
        {text}
      </span>
      <span
        className="mt-1 text-[10px] font-medium uppercase tracking-wider"
        style={{ color: tone.color }}
      >
        {tone.name}
      </span>
    </span>
  )
}

// Компактный вариант для предложений: каждый слог подчёркнут цветом тона, название — в подсказке
// Обращения по возрасту (anh, chị, em...) дополнительно подсвечиваются фоном.
// tones={false} — только подсветка обращений, без цветных подчёркиваний тонов.
export function ToneText({ text, tones = true }) {
  return (
    <span lang="vi">
      {splitWithPronouns(text).map((part, i) => {
        if (part.space || !hasLetters(part.text)) return part.text
        const tone = TONES[detectTone(part.text)]
        const hints = []
        if (tones) hints.push(`${tone.name} — ${tone.ru}`)
        if (part.pronoun) hints.push(`обращение по возрасту: ${AGE_PRONOUNS[part.pronoun]}`)
        return (
          <span
            key={i}
            className={`${tones ? 'border-b-2 pb-px' : ''} ${part.pronoun ? 'rounded bg-amber-100 px-0.5' : ''}`}
            style={tones ? { borderColor: tone.color } : undefined}
            title={hints.join('\n') || undefined}
          >
            {part.text}
          </span>
        )
      })}
    </span>
  )
}

// Мини-легенда тонов, которые встречаются в тексте
export function ToneLegend({ text }) {
  const keys = [...new Set(text.split(/\s+/).filter(hasLetters).map(detectTone))]
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {keys.map((key) => (
        <span key={key} className="inline-flex items-center gap-1 text-[11px] text-muted">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TONES[key].color }} />
          {TONES[key].name}
        </span>
      ))}
    </span>
  )
}
