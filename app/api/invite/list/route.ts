import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * GET /api/invite/list
 * Fetch all pending (non-accepted) invites for the user's tenant.
 * Requires authentication.
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData.user

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tenant
    const { data: userRecord } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle()

    if (!userRecord?.tenant_id) {
      return NextResponse.json({ error: 'User has no tenant' }, { status: 400 })
    }

    // Fetch pending invites (not yet accepted, not expired)
    const { data: invites, error: invitesError } = await supabase
      .from('invites')
      .select('*')
      .eq('tenant_id', userRecord.tenant_id)
      .eq('accepted', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (invitesError) {
      console.error('Failed to fetch invites:', invitesError)
      return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
    }

    return NextResponse.json({ invites: invites || [] })
  } catch (err) {
    console.error('Error listing invites:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
