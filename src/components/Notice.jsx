export const codeClass = 'rounded bg-white/70 px-1.5 py-0.5 font-mono text-xs break-all'

export default function Notice({ tone = 'warning', title, children }) {
  const styles =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-900'
      : 'border-amber-200 bg-amber-50 text-amber-900'
  return (
    <div role="alert" className={`mt-8 rounded-2xl border p-5 text-sm ${styles}`}>
      <p className="font-semibold">{title}</p>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  )
}
