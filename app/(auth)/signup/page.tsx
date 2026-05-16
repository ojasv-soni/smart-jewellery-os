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
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { full_name: name },
        },
      })

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }

      const emailConfirmed = Boolean(data.session?.user?.email_confirmed_at)
      if (emailConfirmed) {
        router.push('/onboarding')
      } else {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      }
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
