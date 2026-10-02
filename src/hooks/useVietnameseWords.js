import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

// status: 'unconfigured' | 'loading' | 'ready' | 'error'
export function useVietnameseWords() {
  const [state, setState] = useState({
    status: isSupabaseConfigured ? 'loading' : 'unconfigured',
    words: [],
    error: null,
  })

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false

    supabase
      .from('vietnamese_words')
      .select('*')
      .order('category')
      .order('created_at')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setState({ status: 'error', words: [], error })
        else setState({ status: 'ready', words: data, error: null })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
