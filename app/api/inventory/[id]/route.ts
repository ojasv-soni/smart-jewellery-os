import { NextResponse } from 'next/server'
import { getServerUserTenant } from '@/lib/supabase-server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase, user, tenantId } = await getServerUserTenant()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!tenantId) return NextResponse.json({ error: 'Tenant record not found' }, { status: 403 })

    const body = await request.json()
    const { id } = params

    const { data, error } = await supabase
      .from('inventory')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()

    if (error) throw error

    return NextResponse.json(data?.[0] || {})
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase, user, tenantId } = await getServerUserTenant()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!tenantId) return NextResponse.json({ error: 'Tenant record not found' }, { status: 403 })

    const { id } = params

    // Soft delete
    const { data, error } = await supabase
      .from('inventory')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to delete inventory' }, { status: 500 })
  }
}