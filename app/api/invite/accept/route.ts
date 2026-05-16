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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const token = body?.token
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    // Look up the invite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 })
    }

    // Check if invite is expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite expired' }, { status: 400 })
    }

    // Verify email matches
    if (user.email !== invite.email) {
      return NextResponse.json(
        { error: `This invite is for ${invite.email}. Please log in with that account.` },
        { status: 403 }
      )
    }

    // Check if user already has a tenant (prevent multi-tenancy bugs)
    const { data: existingUser } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingUser && existingUser.tenant_id) {
      // User already belongs to a tenant; can they join this one? For now, disallow.
      return NextResponse.json(
        { error: 'You already belong to a workspace. Contact support to join another.' },
        { status: 409 }
      )
    }

    // Add user to tenant
    if (existingUser) {
      // User record exists but has no tenant; update it
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
        console.error('User update failed', updateError)
        return NextResponse.json({ error: 'Failed to join workspace' }, { status: 500 })
      }
    } else {
      // Create user record
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
        console.error('User creation failed', createError)
        return NextResponse.json({ error: 'Failed to join workspace' }, { status: 500 })
      }
    }

    // Mark invite as accepted
    const { error: acceptError } = await supabase
      .from('invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('token', token)

    if (acceptError) {
      console.error('Invite acceptance update failed', acceptError)
      // Non-critical error; user is already added
    }

    return NextResponse.json({
      ok: true,
      message: 'Successfully joined workspace',
      tenantId: invite.tenant_id,
      role: invite.role,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case 'owner':
    case 'admin':
      return [
        'add_inventory',
        'edit_inventory',
        'delete_inventory',
        'perform_audit',
        'view_inventory',
        'manage_team',
      ]
    case 'employee':
      return [
        'add_inventory',
        'edit_inventory',
        'view_inventory',
        'perform_audit',
      ]
    case 'viewer':
    default:
      return ['view_inventory']
  }
}
