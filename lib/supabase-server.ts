import { cookies, headers } from 'next/headers'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createServerSupabaseClient(): SupabaseClient {
  const cookieHeader = cookies().toString()
  const authHeader = headers().get('authorization')
  const globalHeaders: Record<string, string> = {}

  if (cookieHeader) {
    globalHeaders.cookie = cookieHeader
  }

  if (authHeader) {
    globalHeaders.Authorization = authHeader
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: globalHeaders,
    },
  })
}

export async function getServerUserTenant() {
  const supabase = createServerSupabaseClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData.user

  if (userError || !user) {
    return { supabase, user: null, tenantId: null, userRecord: null, error: userError }
  }

  const { data: userRecord, error: userRecordError } = await supabase
    .from('users')
    .select('tenant_id, role, permissions')
    .eq('id', user.id)
    .maybeSingle()

  const tenantId = userRecord?.tenant_id ?? null

  return {
    supabase,
    user,
    tenantId,
    userRecord,
    error: userRecordError,
  }
}