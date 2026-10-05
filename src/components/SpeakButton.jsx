import { useEffect, useRef, useState } from 'react'
import { isSpeechSupported, speak, stopSpeaking } from '../lib/speech.js'

const SIZES = {
  md: { button: 'h-10 w-10', icon: 'h-5 w-5' },
  sm: { button: 'h-8 w-8', icon: 'h-4 w-4' },
}

function SpeakerIcon({ className, speaking }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" className={speaking ? 'animate-pulse' : 'opacity-60'} />
    </svg>
  )
}

// onPaper — кнопка стоит на бежевом фоне, делаем её белой, чтобы не сливалась
export default function SpeakButton({ text, label = 'Прослушать', size = 'md', onPaper = false }) {
  const [speaking, setSpeaking] = useState(false)
  const speakingRef = useRef(false)
  speakingRef.current = speaking

  // Ушли со страницы во время звучания — останавливаем
  useEffect(() => () => speakingRef.current && stopSpeaking(), [])

  if (!isSpeechSupported) return null

  function toggle() {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    speak(text, { onEnd: () => setSpeaking(false) })
  }

  const s = SIZES[size]
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={speaking ? 'Остановить' : `${label}: ${text}`}
      aria-pressed={speaking}
      title={speaking ? 'Остановить' : label}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full transition-colors ${s.button} ${
        speaking
          ? 'bg-accent text-white ring-4 ring-accent/20'
          : `${onPaper ? 'bg-white' : 'bg-paper'} text-accent hover:bg-accent/10`
      }`}
    >
      {speaking && <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" aria-hidden="true" />}
      <SpeakerIcon className={`relative ${s.icon}`} speaking={speaking} />
    </button>
  )
}
