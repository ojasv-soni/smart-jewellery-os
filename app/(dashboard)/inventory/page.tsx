'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
      const response = await fetch('/api/inventory')
      const data = await response.json()
      setInventory(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
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
      <header className="bg-card border-b border-border p-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
              <p className="text-muted-foreground mt-1">{filteredInventory.length} items</p>
            </div>
            <button
              onClick={() => router.push('/inventory/add')}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2 text-foreground"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-input border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
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
      <main className="max-w-7xl mx-auto p-6">
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
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
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
      </main>
    </div>
  )
}