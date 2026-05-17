"use client"

import { useState } from 'react'
import getPublicSupabase from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const setUser = useAuthStore((state) => state.setUser)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    
    try {
      const supabase = getPublicSupabase()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const lowerMessage = error.message.toLowerCase()
        if (lowerMessage.includes('confirm') || lowerMessage.includes('verification') || lowerMessage.includes('verify')) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`)
          setLoading(false)
          return
        }

        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      setUser(data.user)

      // Call onboarding endpoint to check/provision user
      try {
        const accessToken = data.session?.access_token

        const onboardResponse = await fetch('/api/onboard', {
          method: 'POST',
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })

        if (!onboardResponse.ok) {
          const onboardError = await onboardResponse.json()
          console.error('[LOGIN] Onboarding error:', onboardError)
          setErrorMessage(`Onboarding failed: ${onboardError.error || 'Unknown error'}`)
          setLoading(false)
          return
        }

        const onboardData = await onboardResponse.json()
        console.log('[LOGIN] Onboarding result:', onboardData)

        // Route based on onboarding completion status
        if (onboardData.onboarded) {
          if (onboardData.onboarding_completed === false) {
            // New user - show onboarding flow
            console.log('[LOGIN] Routing to onboarding (first-time user)')
            router.push('/onboarding')
          } else {
            // Returning user - go to dashboard
            console.log('[LOGIN] Routing to dashboard (returning user)')
            router.push('/dashboard')
          }
        } else {
          console.warn('[LOGIN] Onboarding returned but not marked as onboarded')
          router.push('/dashboard')
        }
      } catch (fetchError) {
        console.error('[LOGIN] Onboarding request failed:', fetchError)
        setErrorMessage(`Session error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`)
        setLoading(false)
        return
      }
    } catch (err) {
      console.error('[LOGIN] Unexpected error:', err)
      setErrorMessage(`Login failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleLogin} className="bg-card p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-foreground">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-border rounded-lg bg-input text-foreground"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border border-border rounded-lg bg-input text-foreground"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
