import { NextResponse } from 'next/server'
import { getServerUserTenant } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const { supabase, user, tenantId } = await getServerUserTenant()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!tenantId) return NextResponse.json({ error: 'Tenant record not found' }, { status: 403 })

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user, tenantId } = await getServerUserTenant()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!tenantId) return NextResponse.json({ error: 'Tenant record not found' }, { status: 403 })

    const body = await request.json()

    const { data, error } = await supabase
      .from('inventory')
      .insert([
        {
          ...body,
          tenant_id: tenantId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data?.[0] || {}, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to create inventory' }, { status: 500 })
  }
}