import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData.user

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check owner/admin role
    const { data: userRecord } = await supabase.from('users').select('tenant_id, role').eq('id', user.id).maybeSingle()
    if (!userRecord || !['owner', 'admin'].includes(userRecord.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const email = body?.email
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // Check for duplicate active invite
    const { data: existingInvite } = await supabase
      .from('invites')
      .select('id, expires_at, accepted')
      .eq('tenant_id', userRecord.tenant_id)
      .eq('email', email)
      .eq('accepted', false)
      .maybeSingle()

    if (existingInvite) {
      // Check if expired
      if (new Date(existingInvite.expires_at) > new Date()) {
        return NextResponse.json(
          { error: 'An active invite already exists for this email. Ask them to check their invite link.' },
          { status: 409 }
        )
      } else {
        // Expired invite; we can create a new one
        const { error: deleteError } = await supabase
          .from('invites')
          .delete()
          .eq('id', existingInvite.id)

        if (deleteError) {
          console.error('Failed to clean up expired invite', deleteError)
        }
      }
    }

    const token = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

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
      console.error('Invite creation failed', inviteError)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    // Return a simple invite link for manual sharing
    const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/accept-invite?token=${token}`

    return NextResponse.json({ ok: true, invite: { email, token, inviteLink } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
