import { NextResponse } from 'next/server'
import { getServerUserTenant } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { supabase, user, tenantId } = await getServerUserTenant()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!tenantId) return NextResponse.json({ error: 'Tenant record not found' }, { status: 403 })

    const body = await request.json()
    const { audit_date, mismatches } = body

    // Create audit log
    const auditLogData = mismatches.map((mismatch: any) => ({
      tenant_id: tenantId,
      inventory_reference: mismatch.inventory_id,
      mismatch_type: mismatch.severity === 'green' ? 'no_issue' : 'quantity_mismatch',
      severity: mismatch.severity,
      notes: mismatch.reason,
      created_by: user.id,
      created_at: audit_date,
    }))

    const { error } = await supabase
      .from('audit_logs')
      .insert(auditLogData)

    if (error) throw error

    // Update inventory quantities based on approved mismatches
    for (const mismatch of mismatches) {
      if (mismatch.difference !== 0) {
        const newQuantity = mismatch.physical_quantity
        await supabase
          .from('inventory')
          .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq('id', mismatch.inventory_id)
          .eq('tenant_id', tenantId)
      }
    }

    return NextResponse.json({ success: true, message: 'Audit completed' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to approve audit' }, { status: 500 })
  }
}