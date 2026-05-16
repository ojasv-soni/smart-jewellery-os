'use client'

import { useState } from 'react'
import { UserPlus, Copy, CheckCircle } from 'lucide-react'
import { useToast } from '@/lib/toast-context'

interface Invite {
  email: string
  role: string
  token?: string
  inviteLink?: string
}

export function TeamManagementSettings() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('employee')
  const [loading, setLoading] = useState(false)
  const [invites, setInvites] = useState<Invite[]>([])
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const { addToast } = useToast()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !role) return

    setLoading(true)
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })

      if (!response.ok) {
        const data = await response.json()
        addToast(data?.error || 'Failed to send invite', 'error')
        setLoading(false)
        return
      }

      const data = await response.json()
      if (data.ok && data.invite) {
        setInvites((prev) => [{ email, role, ...data.invite }, ...prev])
        addToast(`Invite sent to ${email}`, 'success')
        setEmail('')
        setRole('employee')
      }
    } catch (error) {
      addToast('Failed to send invite', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = (link: string, token: string) => {
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    addToast('Invite link copied!', 'success')
    setTimeout(() => setCopiedToken(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <UserPlus size={20} />
          Invite Team Members
        </h3>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground"
            >
              <option value="employee">Employee (Can add & edit inventory)</option>
              <option value="admin">Admin (Can manage team & inventory)</option>
              <option value="viewer">Viewer (Can only view inventory)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

      {/* Invites List */}
      {invites.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Pending Invites</h3>
          <div className="space-y-3">
            {invites.map((invite) => (
              <div key={invite.token} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{invite.email}</p>
                    <p className="text-sm text-muted-foreground">Role: {invite.role}</p>
                  </div>
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                {invite.inviteLink && (
                  <button
                    onClick={() => handleCopyLink(invite.inviteLink!, invite.token!)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition"
                  >
                    <Copy size={16} />
                    {copiedToken === invite.token ? 'Copied!' : 'Copy invite link'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-foreground">
          <strong>How invites work:</strong> Send the invite link to your team member. They'll sign up or log in with that email, then
          accept the invite to join your workspace.
        </p>
      </div>
    </div>
  )
}
