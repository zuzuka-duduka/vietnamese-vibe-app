import { AGE_PRONOUNS, NEUTRAL_HINT, findAgePronouns } from '../lib/pronouns.js'

// Раскрывающаяся пометка под вьетнамским текстом, если в нём есть обращения по возрасту
export default function AgePronounNote({ text }) {
  const pronouns = findAgePronouns(text)
  if (pronouns.length === 0) return null

  return (
    <details className="group mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <summary className="cursor-pointer list-none font-medium marker:hidden">
        👥 Обращение зависит от возраста:{' '}
        <span lang="vi" className="font-semibold">
          {pronouns.join(', ')}
        </span>
        <span className="ml-1 inline-block transition-transform group-open:rotate-180">▾</span>
      </summary>
      <ul className="mt-2 space-y-1">
        {pronouns.map((p) => (
          <li key={p}>
            <span lang="vi" className="font-semibold">{p}</span> — {AGE_PRONOUNS[p]}
          </li>
        ))}
      </ul>
      <p className="mt-2">{NEUTRAL_HINT}</p>
    </details>
  )
}
