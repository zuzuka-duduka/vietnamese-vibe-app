// Шесть тонов вьетнамского языка. Тон определяется по диакритике слога.
export const TONES = {
  ngang: { name: 'ngang', ru: 'ровный', mark: 'a', color: 'var(--color-tone-ngang)', example: 'ma' },
  huyen: { name: 'huyền', ru: 'нисходящий', mark: 'à', color: 'var(--color-tone-huyen)', example: 'mà' },
  sac: { name: 'sắc', ru: 'восходящий', mark: 'á', color: 'var(--color-tone-sac)', example: 'má' },
  hoi: { name: 'hỏi', ru: 'вопросительный', mark: 'ả', color: 'var(--color-tone-hoi)', example: 'mả' },
  nga: { name: 'ngã', ru: 'прерывистый', mark: 'ã', color: 'var(--color-tone-nga)', example: 'mã' },
  nang: { name: 'nặng', ru: 'тяжёлый', mark: 'ạ', color: 'var(--color-tone-nang)', example: 'mạ' },
}

// Коды комбинируемых символов Unicode, которые обозначают тон (после NFD-разложения)
const TONE_MARKS = {
  0x0300: 'huyen', // grave
  0x0301: 'sac',   // acute
  0x0309: 'hoi',   // hook above
  0x0303: 'nga',   // tilde
  0x0323: 'nang',  // dot below
}

// Ключ тона по значению из БД: принимает 'hỏi', 'hoi' и т. п.
export function toneKeyByName(name) {
  const value = (name ?? '').trim().toLowerCase()
  return Object.keys(TONES).find((key) => key === value || TONES[key].name === value) ?? null
}

export function detectTone(syllable) {
  for (const ch of syllable.normalize('NFD')) {
    const tone = TONE_MARKS[ch.codePointAt(0)]
    if (tone) return tone
  }
  return 'ngang'
}
