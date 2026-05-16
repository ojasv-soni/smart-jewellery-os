'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import getPublicSupabase from '@/lib/supabase'
import { InventoryForm } from '@/components/inventory/InventoryForm'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/lib/toast-context'
import { fetchWithRetry, getErrorMessage } from '@/lib/fetch-utils'

export default function AddInventoryPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setLoading(true)
    try {
      const supabase = getPublicSupabase()
      const session = await supabase.auth.getSession()
      const accessToken = session.data.session?.access_token

      const response = await fetchWithRetry('/api/inventory', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(formData),
        retries: 2,
      })

      if (response.ok) {
        addToast('✓ Product added successfully', 'success')
        router.push('/inventory')
      } else {
        if (response.status === 401) {
          addToast('Session expired. Please log in again.', 'error')
          router.push('/login')
          return
        }
        const errorMsg = await getErrorMessage(response)
        addToast(errorMsg, 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      addToast('Connection error. Please check your network and try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Capture image, edit details, and save</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-lg">
          <InventoryForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </main>
    </div>
  )
}