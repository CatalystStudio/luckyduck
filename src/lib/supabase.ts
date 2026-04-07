import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseUrl = (rawUrl && rawUrl !== 'undefined') ? rawUrl.trim() : 'https://placeholder.supabase.co'
const supabaseAnonKey = (rawKey && rawKey !== 'undefined') ? rawKey.trim() : 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
