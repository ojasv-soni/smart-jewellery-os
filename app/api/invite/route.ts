import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData.user

    if (userError || !user) {
      console.error('[INVITE] Auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check owner/admin role
    const { data: userRecord, error: userRecordError } = await supabase.from('users').select('tenant_id, role').eq('id', user.id).maybeSingle()
    
    if (userRecordError) {
      console.error('[INVITE] User record fetch error:', userRecordError)
      return NextResponse.json({ error: `Database error: ${userRecordError.message}` }, { status: 500 })
    }

    if (!userRecord) {
      console.error('[INVITE] User record not found for user:', user.id)
      return NextResponse.json({ error: 'User record not found. Please log out and log back in.' }, { status: 400 })
    }

    if (!['owner', 'admin'].includes(userRecord.role)) {
      console.error('[INVITE] Insufficient permissions. User role:', userRecord.role)
      return NextResponse.json({ error: 'Only owners and admins can create invites' }, { status: 403 })
    }

    const body = await req.json()
    const email = body?.email
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    console.log(`[INVITE] Creating invite for ${email} in tenant ${userRecord.tenant_id}`)

    // Check for duplicate active invite
    const { data: existingInvite, error: existingError } = await supabase
      .from('invites')
      .select('id, expires_at, accepted')
      .eq('tenant_id', userRecord.tenant_id)
      .eq('email', email)
      .eq('accepted', false)
      .maybeSingle()

    if (existingError) {
      console.error('[INVITE] Error checking existing invites:', existingError)
      return NextResponse.json({ error: `Database error: ${existingError.message}` }, { status: 500 })
    }

    if (existingInvite) {
      // Check if expired
      if (new Date(existingInvite.expires_at) > new Date()) {
        console.log(`[INVITE] Active invite already exists for ${email}`)
        return NextResponse.json(
          { error: 'An active invite already exists for this email. Ask them to check their invite link.' },
          { status: 409 }
        )
      } else {
        // Expired invite; we can create a new one
        console.log(`[INVITE] Cleaning up expired invite for ${email}`)
        const { error: deleteError } = await supabase
          .from('invites')
          .delete()
          .eq('id', existingInvite.id)

        if (deleteError) {
          console.error('[INVITE] Failed to clean up expired invite:', deleteError)
        }
      }
    }

    const token = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    console.log(`[INVITE] Inserting new invite token=${token} expires=${expiresAt}`)

    const { data: invite, error: inviteError } = await supabase.from('invites').insert([
      {
        email,
        tenant_id: userRecord.tenant_id,
        role: body?.role ?? 'employee',
        token,
        expires_at: expiresAt,
        created_by: user.id,
        created_at: new Date().toISOString(),
      },
    ]).select().single()

    if (inviteError) {
      console.error('[INVITE] Insert failed:', inviteError)
      return NextResponse.json({ error: `Failed to create invite: ${inviteError.message}` }, { status: 500 })
    }

    // Return a simple invite link for manual sharing
    const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/accept-invite?token=${token}`

    console.log(`[INVITE] Success: created invite for ${email}`)
    return NextResponse.json({ ok: true, invite: { email, token, inviteLink } })
  } catch (err) {
    console.error('[INVITE] Unexpected error:', err)
    return NextResponse.json({ error: `Server error: ${err instanceof Error ? err.message : 'Unknown'}` }, { status: 500 })
  }
}
