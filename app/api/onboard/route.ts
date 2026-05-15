import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()
    const user = userData.user

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userRecord, error: userRecordError } = await supabase
      .from('users')
      .select('tenant_id, role, permissions')
      .eq('id', user.id)
      .maybeSingle()

    if (userRecord && userRecord.tenant_id) {
      return NextResponse.json({ onboarded: true, tenant_id: userRecord.tenant_id, role: userRecord.role })
    }

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
      console.error('Tenant provisioning failed', tenantError)
      return NextResponse.json({ error: 'Failed to provision tenant' }, { status: 500 })
    }

    const defaultPermissions = ['add_inventory', 'edit_inventory', 'delete_inventory', 'perform_audit', 'view_inventory']

    if (!userRecord) {
      const { error: createUserError } = await supabase.from('users').insert([
        {
          id: user.id,
          tenant_id: tenant.id,
          role: 'owner',
          permissions: defaultPermissions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (createUserError) {
        console.error('User provisioning failed', createUserError)
        return NextResponse.json({ error: 'Failed to provision user record' }, { status: 500 })
      }
    } else {
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ tenant_id: tenant.id, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (updateUserError) {
        console.error('User provisioning update failed', updateUserError)
        return NextResponse.json({ error: 'Failed to update user record' }, { status: 500 })
      }
    }

    return NextResponse.json({ onboarded: true, tenant_id: tenant.id, role: 'owner' })
  } catch (error) {
    console.error('Error during onboarding:', error)
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}
