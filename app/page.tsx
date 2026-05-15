'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      try {
        const session = await supabase.auth.getSession()
        const accessToken = session.data.session?.access_token

        await fetch('/api/onboard', {
          method: 'POST',
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })
      } catch (error) {
        console.error('Onboarding check failed:', error)
      }

      router.push('/dashboard')
    }
    checkUser()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-xl text-foreground">Loading SMART JEWELLERY INVENTORY OS...</div>
    </div>
  )
}