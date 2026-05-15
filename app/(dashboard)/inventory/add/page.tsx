'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { InventoryForm } from '@/components/inventory/InventoryForm'
import { ArrowLeft } from 'lucide-react'

export default function AddInventoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const accessToken = session.data.session?.access_token

      const response = await fetch('/api/inventory', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/inventory')
      } else {
        const data = await response.json()
        if (response.status === 401) {
          router.push('/login')
          return
        }
        alert(data?.error || 'Failed to save inventory')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving inventory')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-foreground">Add New Inventory Item</h1>
          <p className="text-muted-foreground mt-1">Capture image, edit details, and save</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <InventoryForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </main>
    </div>
  )
}