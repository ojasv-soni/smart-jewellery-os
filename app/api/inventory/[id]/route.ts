import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id } = params

    const { data, error } = await supabase
      .from('inventory')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params

    // Soft delete
    const { data, error } = await supabase
      .from('inventory')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to delete inventory' }, { status: 500 })
  }
}