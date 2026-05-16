'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import getPublicSupabase from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Package, Plus, Settings, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState({ total: 0, lowStock: 0, weight: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getPublicSupabase()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    const supabase = getPublicSupabase()
    await supabase.auth.signOut()
    logout()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">SMART JEWELLERY INVENTORY OS</h1>
            <p className="text-muted-foreground mt-1">Luxury Inventory Operating System</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <Package className="text-primary mb-3" size={28} />
            <h3 className="text-muted-foreground text-sm">Total Items</h3>
            <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <Package className="text-accent mb-3" size={28} />
            <h3 className="text-muted-foreground text-sm">Low Stock</h3>
            <p className="text-3xl font-bold text-foreground mt-2">{stats.lowStock}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <Package className="text-primary mb-3" size={28} />
            <h3 className="text-muted-foreground text-sm">Total Weight (g)</h3>
            <p className="text-3xl font-bold text-foreground mt-2">{stats.weight.toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => router.push('/inventory/add')}
            className="bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={20} />
            Add Inventory
          </button>
          <button 
            onClick={() => router.push('/inventory')}
            className="bg-secondary text-secondary-foreground py-4 px-6 rounded-lg font-semibold hover:bg-secondary/90 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Package size={20} />
            View Inventory
          </button>
          <button 
            onClick={() => router.push('/settings')}
            className="bg-secondary text-secondary-foreground py-4 px-6 rounded-lg font-semibold hover:bg-secondary/90 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Settings size={20} />
            Settings
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-muted-foreground">
            No recent activity yet. Start by adding your first inventory item.
          </div>
        </div>
      </main>
    </div>
  )
}