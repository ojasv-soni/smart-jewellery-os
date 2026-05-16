import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getPublicSupabase(): SupabaseClient {
	if (_supabase) return _supabase

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseAnonKey) {
		// Defer error to runtime usage. This avoids build-time crashes when env
		// variables are not yet injected (e.g. during static analysis).
		throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
	}

	_supabase = createClient(supabaseUrl, supabaseAnonKey)
	return _supabase
}

// Backwards-compatible default export for simple imports
export default getPublicSupabase