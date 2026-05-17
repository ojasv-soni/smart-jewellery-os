'use client'

import { useEffect, useState } from 'react'
import { UserPlus, Copy, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { useToast } from '@/lib/toast-context'

interface Invite {
  id: string
  email: string
  role: string
  token: string
  accepted: boolean
  expires_at: string
  created_at: string
}

export function TeamManagementSettings() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('employee')
  const [loading, setLoading] = useState(false)
  const [invites, setInvites] = useState<Invite[]>([])
  const [loadingInvites, setLoadingInvites] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const { addToast } = useToast()

  // Load pending invites on mount
  useEffect(() => {
    loadPendingInvites()
  }, [])

  const loadPendingInvites = async () => {
    setLoadingInvites(true)
    setLoadError(null)
    try {
      const response = await fetch('/api/invite/list', {
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[TEAM_SETTINGS] Failed to fetch invites:', errorData)
        setLoadError(errorData.error || 'Failed to load invites')
        setLoadingInvites(false)
        return
      }

      const data = await response.json()
      console.log('[TEAM_SETTINGS] Loaded invites:', data.invites?.length ?? 0)
      setInvites(data.invites || [])
    } catch (error) {
      console.error('[TEAM_SETTINGS] Error loading invites:', error)
      setLoadError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingInvites(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !role) return

    setLoading(true)
    console.log(`[TEAM_SETTINGS] Creating invite for ${email} with role ${role}`)
    
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[TEAM_SETTINGS] Invite creation failed:', data)
        addToast(data?.error || 'Failed to create invite', 'error')
        setLoading(false)
        return
      }

      if (data.ok && data.invite) {
        console.log('[TEAM_SETTINGS] Invite created successfully')
        addToast(`✓ Invite created for ${email}`, 'success')
        setEmail('')
        setRole('employee')
        // Reload invites to show new one
        await loadPendingInvites()
      }
    } catch (error) {
      console.error('[TEAM_SETTINGS] Unexpected error:', error)
      addToast(`Error: ${error instanceof Error ? error.message : 'Failed to create invite'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const getInviteLink = (token: string) => {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/accept-invite?token=${token}`
  }

  const handleCopyLink = (token: string) => {
    const link = getInviteLink(token)
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    console.log('[TEAM_SETTINGS] Copied invite link to clipboard')
    addToast('Invite link copied to clipboard!', 'success')
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const isInviteExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const days = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <UserPlus size={20} />
          Invite Team Member
        </h3>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full bg-input border border-border rounded-lg px-3 md:px-4 py-2.5 text-foreground placeholder-muted-foreground text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 md:px-4 py-2.5 text-foreground text-sm"
            >
              <option value="employee">Employee (add & edit inventory)</option>
              <option value="admin">Admin (manage team & inventory)</option>
              <option value="viewer">Viewer (view only)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 text-sm md:text-base"
          >
            {loading ? 'Creating invite...' : 'Create Invite'}
          </button>
          <p className="text-xs text-muted-foreground">
            💡 Once created, copy the invite link and share it with your team member. They can open it in any browser to accept.
          </p>
        </form>
      </div>

      {/* Pending Invites */}
      {loadingInvites ? (
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 text-center">
          <p className="text-muted-foreground text-sm">Loading invites...</p>
        </div>
      ) : loadError ? (
        <div className="bg-card border border-destructive/20 rounded-lg p-4 md:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-destructive text-sm">Failed to load invites</p>
              <p className="text-xs text-destructive/80 mt-1">{loadError}</p>
            </div>
          </div>
        </div>
      ) : invites.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 text-center">
          <p className="text-muted-foreground text-sm">No pending invites yet</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Pending Invites ({invites.length})</h3>
          <div className="space-y-3">
            {invites.map((invite) => {
              const expired = isInviteExpired(invite.expires_at)
              const daysLeft = getDaysUntilExpiry(invite.expires_at)

              return (
                <div
                  key={invite.id}
                  className="border border-border rounded-lg p-3 md:p-4 hover:bg-muted/20 transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-foreground text-sm md:text-base">{invite.email}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Role: {invite.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {expired ? (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs">
                          <AlertCircle size={14} />
                          Expired
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                          <Clock size={14} />
                          {daysLeft}d left
                        </div>
                      )}
                    </div>
                  </div>

                  {!expired && (
                    <button
                      onClick={() => handleCopyLink(invite.token)}
                      className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition rounded-lg px-3 py-2 hover:bg-primary/5"
                    >
                      <Copy size={16} />
                      {copiedToken === invite.token ? 'Copied!' : 'Copy invite link'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
