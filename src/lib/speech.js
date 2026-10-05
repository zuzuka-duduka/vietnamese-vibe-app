// Озвучка через встроенный в браузер Web Speech API (speechSynthesis).
// Качество зависит от голосов в системе: вьетнамский голос есть не везде.

export const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

export function findVietnameseVoice() {
  if (!isSpeechSupported) return null
  return (
    window.speechSynthesis
      .getVoices()
      .find((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('vi')) ?? null
  )
}

// Озвучивает текст; onEnd вызывается и при окончании, и при прерывании другой фразой
export function speak(text, { onEnd } = {}) {
  const synth = window.speechSynthesis
  synth.cancel() // одновременно звучит только одна фраза

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'vi-VN'
  const voice = findVietnameseVoice()
  if (voice) utterance.voice = voice
  utterance.rate = 0.85 // чуть медленнее — новичку легче расслышать тоны
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()
  synth.speak(utterance)
}

export function stopSpeaking() {
  if (isSpeechSupported) window.speechSynthesis.cancel()
}
