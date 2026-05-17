import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * Accept an invite token and add the user to the tenant.
 * Expects: { token: string }
 * User must already be logged in (and have signed up).
 */
export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData.user

    if (userError || !user) {
      console.error('[INVITE_ACCEPT] Auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const token = body?.token
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    console.log(`[INVITE_ACCEPT] Accepting invite token=${token} for user=${user.email}`)

    // Look up the invite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (inviteError) {
      console.error('[INVITE_ACCEPT] Invite lookup error:', inviteError)
      return NextResponse.json({ error: `Database error: ${inviteError.message}` }, { status: 500 })
    }

    if (!invite) {
      console.warn(`[INVITE_ACCEPT] Invite not found for token=${token}`)
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 })
    }

    console.log(`[INVITE_ACCEPT] Found invite: email=${invite.email}, role=${invite.role}, tenant=${invite.tenant_id}`)

    // Check if invite is expired
    if (new Date(invite.expires_at) < new Date()) {
      console.warn(`[INVITE_ACCEPT] Invite expired: ${invite.expires_at}`)
      return NextResponse.json({ error: 'Invite expired' }, { status: 400 })
    }

    // Verify email matches
    if (user.email !== invite.email) {
      console.warn(`[INVITE_ACCEPT] Email mismatch: user=${user.email} invite=${invite.email}`)
      return NextResponse.json(
        { error: `This invite is for ${invite.email}. Please log in with that account.` },
        { status: 403 }
      )
    }

    // Check if user already has a tenant (prevent multi-tenancy bugs)
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingUserError) {
      console.error('[INVITE_ACCEPT] Error checking existing user:', existingUserError)
      return NextResponse.json({ error: `Database error: ${existingUserError.message}` }, { status: 500 })
    }

    if (existingUser && existingUser.tenant_id) {
      // User already belongs to a tenant; can they join this one? For now, disallow.
      console.warn(`[INVITE_ACCEPT] User already has tenant: ${existingUser.tenant_id}`)
      return NextResponse.json(
        { error: 'You already belong to a workspace. Contact support to join another.' },
        { status: 409 }
      )
    }

    // Add user to tenant
    if (existingUser) {
      // User record exists but has no tenant; update it
      console.log(`[INVITE_ACCEPT] Updating user record with tenant=${invite.tenant_id} role=${invite.role}`)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          tenant_id: invite.tenant_id,
          role: invite.role,
          permissions: getDefaultPermissions(invite.role),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('[INVITE_ACCEPT] User update failed:', updateError)
        return NextResponse.json({ error: `Failed to join workspace: ${updateError.message}` }, { status: 500 })
      }
    } else {
      // Create user record
      console.log(`[INVITE_ACCEPT] Creating user record with tenant=${invite.tenant_id} role=${invite.role}`)
      const { error: createError } = await supabase.from('users').insert([
        {
          id: user.id,
          tenant_id: invite.tenant_id,
          role: invite.role,
          permissions: getDefaultPermissions(invite.role),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (createError) {
        console.error('[INVITE_ACCEPT] User creation failed:', createError)
        return NextResponse.json({ error: `Failed to create user record: ${createError.message}` }, { status: 500 })
      }
    }

    // Mark invite as accepted
    console.log(`[INVITE_ACCEPT] Marking invite as accepted`)
    const { error: acceptError } = await supabase
      .from('invites')
      .update({ accepted: true, accepted_at: new Date().toISOString() })
      .eq('token', token)

    if (acceptError) {
      console.error('[INVITE_ACCEPT] Invite acceptance update failed (non-critical):', acceptError)
      // Non-critical error; user is already added
    }

    console.log(`[INVITE_ACCEPT] Success: user joined tenant`)
    return NextResponse.json({
      ok: true,
      message: 'Successfully joined workspace',
      tenantId: invite.tenant_id,
      role: invite.role,
    })
  } catch (err) {
    console.error('[INVITE_ACCEPT] Unexpected error:', err)
    return NextResponse.json({ error: `Server error: ${err instanceof Error ? err.message : 'Unknown'}` }, { status: 500 })
  }
}

function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case 'owner':
    case 'admin':
      return ['add_inventory', 'edit_inventory', 'delete_inventory', 'perform_audit', 'view_inventory', 'manage_team']
    case 'employee':
      return ['add_inventory', 'edit_inventory', 'perform_audit', 'view_inventory']
    case 'viewer':
    default:
      return ['view_inventory']
  }
}
