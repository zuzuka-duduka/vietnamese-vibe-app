// Валидатор пачки новых фраз для агента пополнения базы (.claude/skills/words-agent).
//
// Запуск:  node scripts/validate-words.mjs batch.json [existing.json]
//   batch.json    — массив новых записей vietnamese_words
//   existing.json — необязательно: массив { word_vi, pattern_sentence } из базы для проверки дубликатов
//
// Код выхода 0 — пачка прошла проверку, 1 — есть ошибки (записывать в базу нельзя).
import { readFileSync } from 'node:fs'
import { findAgePronouns } from '../src/lib/pronouns.js'
import { TONES, detectTone, toneKeyByName } from '../src/lib/tones.js'

const CANONICAL_TONES = Object.values(TONES).map((t) => t.name) // ngang, huyền, sắc, hỏi, ngã, nặng
const FIELDS = ['word_vi', 'tone_type', 'phonetic', 'translation_ru', 'pattern_sentence', 'category']

// Для сравнения дубликатов: регистр, пробелы и знаки препинания не важны, диакритика — важна
const normalize = (s) =>
  String(s ?? '').normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8').replace(/^﻿/, ''))

function splitPattern(pattern) {
  const match = String(pattern ?? '').match(/^(.*?)\s+—\s+(.*)$/s)
  return match ? [match[1].trim(), match[2].trim()] : null
}

function validateRow(row) {
  const errors = []
  const warnings = []

  for (const field of FIELDS) {
    if (typeof row[field] !== 'string' || !row[field].trim()) errors.push(`нет поля ${field}`)
  }
  if (errors.length) return { errors, warnings }

  if (!/^[a-z][a-z0-9_]*$/.test(row.category)) errors.push(`category «${row.category}» — нужен snake_case`)

  if (!CANONICAL_TONES.includes(row.tone_type)) {
    errors.push(`tone_type «${row.tone_type}» — допустимо только: ${CANONICAL_TONES.join(', ')}`)
  } else {
    const syllableTones = row.word_vi.split(/\s+/).map(detectTone)
    if (!syllableTones.includes(toneKeyByName(row.tone_type))) {
      errors.push(`tone_type «${row.tone_type}» не встречается ни в одном слоге «${row.word_vi}»`)
    }
  }

  if (!/^\[[а-яё\s,.!?\-]+\]$/i.test(row.phonetic)) {
    errors.push(`phonetic «${row.phonetic}» — нужна кириллица в квадратных скобках, например [чо той]`)
  }

  if (!/[а-яё]/i.test(row.translation_ru)) errors.push('translation_ru без кириллицы')

  const parts = splitPattern(row.pattern_sentence)
  if (!parts) {
    errors.push('pattern_sentence должен быть «вьетнамское предложение — русский перевод» (длинное тире с пробелами)')
  } else {
    const [vi, ru] = parts
    if (!/[а-яё]/i.test(ru)) errors.push('в переводе pattern_sentence нет кириллицы')
    if (/[а-яё]/i.test(vi)) errors.push('во вьетнамской части pattern_sentence есть кириллица')
    if (/—/.test(ru)) errors.push('в переводе pattern_sentence второе длинное тире — замените на запятую')

    const pronouns = findAgePronouns(vi)
    if (pronouns.length) {
      errors.push(`возрастные обращения в pattern_sentence: ${pronouns.join(', ')} — перепишите нейтрально (tôi, без обращения)`)
    }
    if (!normalize(vi).includes(normalize(row.word_vi))) {
      warnings.push('pattern_sentence не содержит саму фразу word_vi дословно')
    }
  }

  const wordPronouns = findAgePronouns(row.word_vi)
  if (wordPronouns.length) errors.push(`возрастные обращения в word_vi: ${wordPronouns.join(', ')}`)

  return { errors, warnings }
}

const [batchPath, existingPath] = process.argv.slice(2)
if (!batchPath) {
  console.error('Использование: node scripts/validate-words.mjs batch.json [existing.json]')
  process.exit(2)
}

const batch = readJson(batchPath)
const existing = existingPath ? readJson(existingPath) : []
const seenWords = new Map(existing.map((r) => [normalize(r.word_vi), 'в базе']))
const seenPatterns = new Map(
  existing.map((r) => [normalize(splitPattern(r.pattern_sentence)?.[0] ?? r.pattern_sentence), 'в базе']),
)

let failed = 0
for (const [i, row] of batch.entries()) {
  const { errors, warnings } = validateRow(row)

  const wordKey = normalize(row.word_vi)
  if (seenWords.has(wordKey)) errors.push(`дубликат word_vi (${seenWords.get(wordKey)})`)
  seenWords.set(wordKey, `в пачке, №${i + 1}`)

  const patternKey = normalize(splitPattern(row.pattern_sentence)?.[0] ?? '')
  if (patternKey && seenPatterns.has(patternKey)) errors.push(`дубликат примера (${seenPatterns.get(patternKey)})`)
  if (patternKey) seenPatterns.set(patternKey, `в пачке, №${i + 1}`)

  const status = errors.length ? '✗' : '✓'
  if (errors.length) failed++
  console.log(`${status} ${i + 1}. ${row.word_vi ?? '(без word_vi)'}`)
  for (const e of errors) console.log(`    ошибка: ${e}`)
  for (const w of warnings) console.log(`    внимание: ${w}`)
}

console.log(`\nИтого: ${batch.length - failed} из ${batch.length} прошли проверку`)
process.exit(failed ? 1 : 0)
