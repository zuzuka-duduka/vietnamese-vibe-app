// Словарь категорий: ключ — значение поля category в таблице vietnamese_words.
// includes — дополнительные категории из базы, которые показываются внутри этого раздела.
export const CATEGORY_DICTIONARY = {
  food: { title: 'Еда и напитки', icon: '🍲', includes: ['coffee'] },
  transport: { title: 'Транспорт и такси', icon: '🚖' },
  shopping: { title: 'Покупки и рынок', icon: '🛍️' },
  greetings: { title: 'Приветствия и знакомство', icon: '👋' },
  numbers_money: { title: 'Числа и деньги', icon: '💵' },
  pharmacy_health: { title: 'Аптека и здоровье', icon: '💊' },
  hotel: { title: 'Отель и жильё', icon: '🏨' },
  navigation: { title: 'Навигация и город', icon: '🗺️' },
}

const DEFAULT_ICON = '📌'

// rental_bike → Rental bike
export function formatCategoryName(category) {
  const text = String(category).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Название и иконка категории; для неизвестных — отформатированное имя и 📌
export function categoryInfo(category) {
  const entry = CATEGORY_DICTIONARY[category]
  return entry
    ? { title: entry.title, icon: entry.icon }
    : { title: formatCategoryName(category), icon: DEFAULT_ICON }
}

// Раскладывает слова по разделам: сначала все разделы словаря (пустые — тоже, с пометкой «Скоро»),
// затем категории из базы, которых в словаре пока нет.
export function groupWords(words) {
  const groups = Object.entries(CATEGORY_DICTIONARY).map(([id, entry]) => {
    const dbCategories = [id, ...(entry.includes ?? [])]
    return {
      id,
      title: entry.title,
      icon: entry.icon,
      words: words.filter((w) => dbCategories.includes(w.category)),
    }
  })

  const known = new Set(
    Object.entries(CATEGORY_DICTIONARY).flatMap(([id, entry]) => [id, ...(entry.includes ?? [])]),
  )
  const unknown = [...new Set(words.map((w) => w.category).filter((c) => c && !known.has(c)))]
  for (const category of unknown) {
    groups.push({
      id: category,
      ...categoryInfo(category),
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
