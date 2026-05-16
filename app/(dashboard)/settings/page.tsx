'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store'
import getPublicSupabase from '@/lib/supabase'
import { ArrowLeft, Lock, Bell, Palette, Users } from 'lucide-react'
import { TeamManagementSettings } from '@/components/settings/TeamManagementSettings'

export default function SettingsPage() {
  const router = useRouter()
  const { logout } = useAuthStore()
  const params = useSearchParams()
  const defaultTab = params.get('tab') || 'general'
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleLogout = async () => {
    const supabase = getPublicSupabase()
    await supabase.auth.signOut()
    logout()
    router.push('/login')
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Palette },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card/50 sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition text-sm md:text-base ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-foreground mb-4">Preferences</h2>
              <div className="space-y-4 border-t border-border pt-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Theme</label>
                  <select className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground">
                    <option>Dark</option>
                    <option>Light</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Language</label>
                  <select className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground">
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Currency</label>
                  <select className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground">
                    <option>₹ INR</option>
                    <option>$ USD</option>
                    <option>€ EUR</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && <TeamManagementSettings />}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-foreground mb-4">Security</h2>
              <div className="space-y-3 border-t border-border pt-4">
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted/50 transition flex justify-between items-center group">
                  <span className="text-foreground">Change Password</span>
                  <span className="text-muted-foreground group-hover:text-foreground transition">→</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted/50 transition flex justify-between items-center group">
                  <span className="text-foreground">Two-Factor Authentication</span>
                  <span className="text-muted-foreground group-hover:text-foreground transition">→</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted/50 transition flex justify-between items-center group">
                  <span className="text-foreground">Active Sessions</span>
                  <span className="text-muted-foreground group-hover:text-foreground transition">→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-foreground mb-4">Notification Settings</h2>
              <div className="space-y-3 border-t border-border pt-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-foreground">Low stock alerts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-foreground">Inventory updates</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-foreground">Marketing emails</span>
                </label>
              </div>
            </div>

            {/* Logout Section */}
            <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
              <h2 className="text-lg font-bold text-destructive mb-3">Logout</h2>
              <button
                onClick={handleLogout}
                className="w-full bg-destructive text-destructive-foreground py-2 px-4 rounded-lg hover:bg-destructive/90 transition font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}