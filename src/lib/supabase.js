import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Плейсхолдеры из .env.local считаются незаполненными ключами
const isFilled = (value) => Boolean(value) && !value.includes('your-')

export const isSupabaseConfigured = isFilled(url) && isFilled(anonKey)

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null
