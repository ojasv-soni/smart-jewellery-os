"use client"

import { useState } from 'react'
import getPublicSupabase from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = getPublicSupabase()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }

      // Trigger server-side onboarding to create tenant and user mapping
      try {
        const accessToken = data.session?.access_token
        await fetch('/api/onboard', {
          method: 'POST',
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })
      } catch (onboardError) {
        console.error('Onboarding failed:', onboardError)
      }

      // After signup, send user to onboarding welcome page
      router.push('/onboarding')
    } catch (err) {
      console.error(err)
      alert('Signup failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleSignup} className="bg-card p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-foreground">Create Account</h1>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 mb-3 border border-border rounded-lg bg-input text-foreground"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 border border-border rounded-lg bg-input text-foreground"
          required
        />
        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border border-border rounded-lg bg-input text-foreground"
          required
          minLength={8}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
