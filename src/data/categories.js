// Разделы карточек. dbCategories — какие значения category из таблицы vietnamese_words входят в раздел.
export const categoryGroups = [
  { id: 'food', emoji: '🍜', title: 'Еда и напитки', dbCategories: ['food', 'coffee'] },
  { id: 'greetings', emoji: '👋', title: 'Приветствия', dbCategories: ['greetings'] },
  { id: 'shopping', emoji: '🛍️', title: 'Покупки', dbCategories: ['shopping'] },
  { id: 'transport', emoji: '🛵', title: 'Транспорт и такси', dbCategories: ['transport'] },
]

// Раскладывает слова по разделам. Категории из базы, которых нет в списке выше,
// получают собственный раздел-папку, чтобы ни одна фраза не потерялась.
export function groupWords(words) {
  const known = new Set(categoryGroups.flatMap((g) => g.dbCategories))
  const groups = categoryGroups.map((g) => ({
    ...g,
    words: words.filter((w) => g.dbCategories.includes(w.category)),
  }))
  const extra = [...new Set(words.map((w) => w.category).filter((c) => c && !known.has(c)))]
  for (const category of extra) {
    groups.push({
      id: category,
      emoji: '📁',
      title: category,
      dbCategories: [category],
      words: words.filter((w) => w.category === category),
    })
  }
  return groups
}

// 1 выражение, 2 выражения, 5 выражений
export function pluralPhrases(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} выражение`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} выражения`
  return `${n} выражений`
}
