'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'

export default function AcceptInvitePage() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No invite token provided')
      return
    }

    const acceptInvite = async () => {
      try {
        const response = await fetch('/api/invite/accept', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          setStatus('error')
          setMessage(data?.error || 'Failed to accept invite')
          return
        }

        setStatus('success')
        setMessage('✓ Successfully joined! Redirecting to dashboard...')

        // Redirect after 2s
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (err) {
        console.error(err)
        setStatus('error')
        setMessage('Connection error. Please try again.')
      }
    }

    acceptInvite()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-foreground mb-6">Accept Invite</h1>

        {status === 'loading' && (
          <div>
            <Loader className="mx-auto text-primary mb-4 animate-spin" size={40} />
            <p className="text-muted-foreground">Processing your invite...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle className="mx-auto text-green-600 mb-4" size={40} />
            <p className="text-foreground font-semibold">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <AlertCircle className="mx-auto text-destructive mb-4" size={40} />
            <p className="text-destructive font-semibold mb-4">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
