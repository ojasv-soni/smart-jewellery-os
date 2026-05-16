'use client'

import { useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import getPublicSupabase from '@/lib/supabase'
import { Mail, RefreshCw, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const router = useRouter()
  const email = params.get('email') ?? ''
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('Please check your inbox to verify your email address.')

  const formattedEmail = useMemo(() => email || 'your email address', [email])

  const handleResend = async () => {
    if (!email) {
      setStatus('error')
      setMessage('Please go back and enter an email address to resend verification instructions.')
      return
    }

    setStatus('sending')
    try {
      const supabase = getPublicSupabase()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (error) {
        setStatus('error')
        setMessage(error.message)
        return
      }

      setStatus('sent')
      setMessage(`A verification link has been sent to ${formattedEmail}. Please check your inbox and spam folder.`)
    } catch (error) {
      console.error('Resend verification failed:', error)
      setStatus('error')
      setMessage('Unable to resend verification instructions right now. Please try again in a moment.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Verify Your Email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a verification message to <span className="font-semibold text-foreground">{formattedEmail}</span>.
          </p>
          <p className="text-sm text-muted-foreground">Open your inbox and follow the link to continue logging in.</p>
        </div>

        <div className="mt-8 space-y-4">
          <div className={`rounded-xl p-4 text-sm ${status === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-muted/10 text-foreground'}`}>
            {message}
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={status === 'sending'}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90 transition disabled:opacity-50"
          >
            {status === 'sending' ? 'Resending...' : 'Resend verification email'}
            <RefreshCw size={18} />
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-foreground hover:bg-muted/80 transition"
          >
            Back to Login
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
