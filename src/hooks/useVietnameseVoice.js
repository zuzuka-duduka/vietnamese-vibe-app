import { useEffect, useState } from 'react'
import { findVietnameseVoice, isSpeechSupported } from '../lib/speech.js'

// Список голосов браузер загружает асинхронно — ждём событие voiceschanged.
// status: 'unsupported' | 'loading' | 'ready' | 'missing'
export function useVietnameseVoice() {
  const [status, setStatus] = useState(isSpeechSupported ? 'loading' : 'unsupported')

  useEffect(() => {
    if (!isSpeechSupported) return
    const synth = window.speechSynthesis
    const check = () => {
      if (synth.getVoices().length === 0) return
      setStatus(findVietnameseVoice() ? 'ready' : 'missing')
    }
    check()
    synth.addEventListener('voiceschanged', check)
    // Некоторые браузеры не присылают voiceschanged, если голосов нет совсем
    const timer = setTimeout(() => setStatus((s) => (s === 'loading' ? 'missing' : s)), 2000)
    return () => {
      synth.removeEventListener('voiceschanged', check)
      clearTimeout(timer)
    }
  }, [])

  return status
}
