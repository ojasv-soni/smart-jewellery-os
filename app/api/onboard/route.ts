import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()
    const user = userData.user

    if (authError || !user) {
      console.error('[ONBOARD] Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[ONBOARD] Processing onboarding for user=${user.email} id=${user.id}`)

    // Check if user already has a tenant
    const { data: userRecord, error: userRecordError } = await supabase
      .from('users')
      .select('tenant_id, role, permissions, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()

    if (userRecordError) {
      console.error('[ONBOARD] User record fetch error:', userRecordError)
      return NextResponse.json({ error: `Database error: ${userRecordError.message}` }, { status: 500 })
    }

    if (userRecord && userRecord.tenant_id && userRecord.onboarding_completed) {
      console.log('[ONBOARD] User already onboarded, returning existing tenant')
      return NextResponse.json({
        onboarded: true,
        tenant_id: userRecord.tenant_id,
        role: userRecord.role,
        onboarding_completed: true,
      })
    }

    // If user record exists and has a tenant but not completed onboarding, mark as complete
    if (userRecord && userRecord.tenant_id) {
      console.log('[ONBOARD] User has tenant but onboarding incomplete, marking as complete')
      const { error: updateError } = await supabase
        .from('users')
        .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (updateError) {
        console.error('[ONBOARD] Failed to mark onboarding complete:', updateError)
        return NextResponse.json({ error: `Database error: ${updateError.message}` }, { status: 500 })
      }

      return NextResponse.json({
        onboarded: true,
        tenant_id: userRecord.tenant_id,
        role: userRecord.role,
        onboarding_completed: true,
      })
    }

    // New user - create tenant and user record
    console.log('[ONBOARD] Creating new tenant and user record')

    const businessName = `Studio ${user.email?.split('@')[0] ?? 'Jewellery'}`
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert([
        {
          business_name: businessName,
          subscription_plan: 'trial',
          expiry_date: expiryDate,
          session_limits: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (tenantError || !tenant) {
      console.error('[ONBOARD] Tenant provisioning failed:', tenantError)
      return NextResponse.json({ error: `Failed to provision tenant: ${tenantError?.message || 'Unknown'}` }, { status: 500 })
    }

    console.log(`[ONBOARD] Created tenant=${tenant.id}`)

    const defaultPermissions = ['add_inventory', 'edit_inventory', 'delete_inventory', 'perform_audit', 'view_inventory']

    if (!userRecord) {
      const { error: createUserError } = await supabase.from('users').insert([
        {
          id: user.id,
          tenant_id: tenant.id,
          role: 'owner',
          permissions: defaultPermissions,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (createUserError) {
        console.error('[ONBOARD] User provisioning failed:', createUserError)
        return NextResponse.json({ error: `Failed to provision user: ${createUserError.message}` }, { status: 500 })
      }
      console.log('[ONBOARD] Created user record')
    } else {
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ tenant_id: tenant.id, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (updateUserError) {
        console.error('[ONBOARD] User provisioning update failed:', updateUserError)
        return NextResponse.json({ error: `Failed to update user: ${updateUserError.message}` }, { status: 500 })
      }
      console.log('[ONBOARD] Updated user record with new tenant')
    }

    console.log('[ONBOARD] Success: new user provisioned')
    return NextResponse.json({ onboarded: true, tenant_id: tenant.id, role: 'owner', onboarding_completed: false })
  } catch (error) {
    console.error('[ONBOARD] Unexpected error:', error)
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    )
  }
}
