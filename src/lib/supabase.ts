import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. .env.local.example 을 참고해 .env.local 을 작성하세요.',
  )
}

// anon key만 사용 — RLS가 쓰기를 막으므로 클라이언트에 노출돼도 안전.
// (docs/architecture.md 참고. service_role key는 절대 여기 넣지 않는다.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
