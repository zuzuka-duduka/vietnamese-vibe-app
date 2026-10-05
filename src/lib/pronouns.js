// Местоимения-обращения, которые зависят от возраста и пола собеседника.
// Новичку важно понимать: это не часть фразы, а «слот», куда подставляется своё обращение.
export const AGE_PRONOUNS = {
  anh: 'к мужчине чуть старше вас (так же он говорит о себе)',
  chị: 'к женщине чуть старше вас (так же она говорит о себе)',
  em: 'к тому, кто младше вас, — например, к молодому официанту; младший так говорит о себе',
  cô: 'к женщине возраста ваших родителей или к учительнице',
  chú: 'к мужчине чуть младше ваших родителей',
  bác: 'к человеку старше ваших родителей',
  ông: 'к пожилому мужчине',
  bà: 'к пожилой женщине',
  cháu: 'о себе в разговоре с людьми возраста ваших родителей и старше',
}

export const NEUTRAL_HINT =
  'Это обращение подбирают под конкретного собеседника — не заучивайте его как часть фразы. С ровесниками говорят bạn, о себе нейтрально — tôi.'

const normalize = (word) => word.toLowerCase().replace(/[^\p{L}]/gu, '')

// Слова, в которых «местоимение» на самом деле часть другого слова:
// chú ý — «внимание», tiếng Anh — «английский язык», nước Anh — «Англия»
function isException(word, prev, next) {
  if (word === 'chú' && next === 'ý') return true
  if (word === 'anh' && ['tiếng', 'nước'].includes(prev)) return true
  return false
}

// Возвращает местоимение (в нижнем регистре), если words[i] — возрастное обращение
export function agePronounAt(words, i) {
  const word = normalize(words[i])
  if (!AGE_PRONOUNS[word]) return null
  const prev = i > 0 ? normalize(words[i - 1]) : ''
  const next = i < words.length - 1 ? normalize(words[i + 1]) : ''
  return isException(word, prev, next) ? null : word
}

// Разбивает текст на слова и пробелы, помечая возрастные обращения
export function splitWithPronouns(text) {
  const parts = text.split(/(\s+)/)
  const words = parts.filter((p, i) => i % 2 === 0)
  return parts.map((part, i) =>
    i % 2 === 1 ? { text: part, space: true } : { text: part, pronoun: agePronounAt(words, i / 2) },
  )
}

export function findAgePronouns(text) {
  return [...new Set(splitWithPronouns(text).map((p) => p.pronoun).filter(Boolean))]
}
