'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Lock, Bell, Palette } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-6 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-6">
        <div className="space-y-6">
          {/* Security Section */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-primary" size={24} />
              <h2 className="text-xl font-bold text-foreground">Security</h2>
            </div>
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

          {/* Preferences Section */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="text-primary" size={24} />
              <h2 className="text-xl font-bold text-foreground">Preferences</h2>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted/50 transition flex justify-between items-center group">
                <span className="text-foreground">Theme</span>
                <span className="text-muted-foreground group-hover:text-foreground transition">Dark</span>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted/50 transition flex justify-between items-center group">
                <span className="text-foreground">Language</span>
                <span className="text-muted-foreground group-hover:text-foreground transition">English</span>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted/50 transition flex justify-between items-center group">
                <span className="text-foreground">Currency</span>
                <span className="text-muted-foreground group-hover:text-foreground transition">₹ INR</span>
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-primary" size={24} />
              <h2 className="text-xl font-bold text-foreground">Notifications</h2>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded"
                />
                <span className="text-foreground">Low stock alerts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded"
                />
                <span className="text-foreground">Inventory updates</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                />
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
      </main>
    </div>
  )
}