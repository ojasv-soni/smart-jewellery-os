import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * Mark user's onboarding as complete.
 * Called when user finishes the onboarding flow.
 */
export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()
    const user = userData.user

    if (authError || !user) {
      console.error('[ONBOARDING_COMPLETE] Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[ONBOARDING_COMPLETE] Marking onboarding complete for user=${user.email}`)

    const { error: updateError } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[ONBOARDING_COMPLETE] Update failed:', updateError)
      return NextResponse.json({ error: `Database error: ${updateError.message}` }, { status: 500 })
    }

    console.log('[ONBOARDING_COMPLETE] Success')
    return NextResponse.json({ ok: true, message: 'Onboarding marked as complete' })
  } catch (error) {
    console.error('[ONBOARDING_COMPLETE] Unexpected error:', error)
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    )
  }
}
