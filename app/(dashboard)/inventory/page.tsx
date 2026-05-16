'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import getPublicSupabase from '@/lib/supabase'
import { InventoryCard } from '@/components/inventory/InventoryCard'
import { Inventory } from '@/types/database'
import { Plus, List, Grid3x3, Search } from 'lucide-react'

export default function InventoryPage() {
  const router = useRouter()
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const supabase = getPublicSupabase()
      const session = await supabase.auth.getSession()
      const accessToken = session.data.session?.access_token
      const response = await fetch('/api/inventory', {
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      })
      const data = await response.json()

      if (!response.ok || !Array.isArray(data)) {
        console.error('Unexpected inventory response:', data)
        if (response.status === 401 || data?.error === 'Unauthorized') {
          router.push('/login')
          return
        }
        setInventory([])
        return
      }

      setInventory(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
        setInventory(inventory.filter((item) => item.id !== id))
      } catch (error) {
        alert('Error deleting inventory')
      }
    }
  }

  const filteredInventory = inventory.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <div className="flex justify-between items-start gap-3 mb-4 md:items-center">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">Inventory</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">{filteredInventory.length} items</p>
            </div>
            <button
              onClick={() => router.push('/inventory/add')}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-3 md:px-4 py-2 rounded-lg hover:bg-primary/90 transition flex-shrink-0 text-sm md:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

          {/* Search Bar & View Mode */}
          <div className="flex gap-2 md:gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2 text-sm md:text-base text-foreground"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-input border border-border rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`p-2 rounded transition ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={`p-2 rounded transition ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-foreground">Loading inventory...</div>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No inventory items yet</p>
              <button
                onClick={() => router.push('/inventory/add')}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition"
              >
                Add Your First Item
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
                  : 'space-y-3 md:space-y-4'
              }
            >
              {filteredInventory.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onEdit={(item) => router.push(`/inventory/${item.id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}