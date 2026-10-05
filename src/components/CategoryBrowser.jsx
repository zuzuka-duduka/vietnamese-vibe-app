import { useMemo, useState } from 'react'
import { groupWords, pluralPhrases } from '../data/categories.js'
import VietnameseCard from './VietnameseCard.jsx'

function CategoryGrid({ groups, onOpen }) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {groups.map((g) => {
        const empty = g.words.length === 0
        return (
          <button
            key={g.id}
            type="button"
            disabled={empty}
            onClick={() => onOpen(g.id)}
            className="group flex flex-col items-start rounded-2xl border border-line bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-default disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper text-3xl transition-transform group-hover:scale-110 group-disabled:scale-100">
              {g.icon}
            </span>
            <span className="mt-4 text-lg font-semibold">{g.title}</span>
            <span className="mt-1 text-sm text-muted">{empty ? 'Скоро' : pluralPhrases(g.words.length)}</span>
          </button>
        )
      })}
    </div>
  )
}

function CategoryDetail({ group, onBack }) {
  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-paper"
        >
          ← Назад ко всем категориям
        </button>
        <h2 className="text-lg font-semibold">
          {group.icon} {group.title} <span className="text-muted">({group.words.length})</span>
        </h2>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {group.words.map((word) => (
          <VietnameseCard key={word.id} {...word} />
        ))}
      </div>
    </>
  )
}

export default function CategoryBrowser({ words }) {
  const [openId, setOpenId] = useState(null)
  const groups = useMemo(() => groupWords(words), [words])
  const open = groups.find((g) => g.id === openId && g.words.length > 0)

  function navigate(id) {
    setOpenId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return open ? (
    <CategoryDetail group={open} onBack={() => navigate(null)} />
  ) : (
    <CategoryGrid groups={groups} onOpen={navigate} />
  )
}
