'use client'

import { useState } from 'react'
import { Inventory } from '@/types/database'
import { ImageUpload } from './ImageUpload'
import { AISuggestions } from './AISuggestions'

interface InventoryFormProps {
  onSubmit: (data: any) => void
  initialData?: Inventory
  loading?: boolean
}

const categories = ['Ring', 'Necklace', 'Bracelet', 'Earring', 'Pendant', 'Chain', 'Bangle', 'Other']
const statuses = ['In Stock', 'Low Stock', 'Out of Stock']

export function InventoryForm({ onSubmit, initialData, loading }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    product_name: initialData?.product_name || '',
    category: initialData?.category || '',
    gross_weight: initialData?.gross_weight || 0,
    quantity: initialData?.quantity || 1,
    purchase_price: initialData?.purchase_price || 0,
    selling_price: initialData?.selling_price || 0,
    vendor: initialData?.vendor || '',
    storage_location: initialData?.storage_location || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'In Stock',
  })

  const [imagePreview, setImagePreview] = useState<string>('')
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  const [analyzingImage, setAnalyzingImage] = useState(false)

  const handleImageUpload = async (file: File) => {
    // Preview
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Simulate AI analysis (in real app, call OpenRouter API)
    setAnalyzingImage(true)
    setTimeout(() => {
      setAiSuggestions({
        product_name: 'Gold Ring',
        category: 'Ring',
        confidence: 92,
        duplicate_warning: false,
      })
      setAnalyzingImage(false)
    }, 1500)
  }

  const handleApplySuggestions = (suggestions: any) => {
    setFormData((prev) => ({
      ...prev,
      product_name: suggestions.product_name,
      category: suggestions.category,
    }))
    setAiSuggestions(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <h3 className="text-foreground font-bold mb-3">Product Image</h3>
        <ImageUpload
          onUpload={handleImageUpload}
          preview={imagePreview}
          onRemove={() => setImagePreview('')}
        />
      </div>

      {/* AI Suggestions */}
      {(aiSuggestions || analyzingImage) && (
        <AISuggestions
          suggestions={aiSuggestions}
          onApply={handleApplySuggestions}
          loading={analyzingImage}
        />
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-foreground font-semibold mb-2">Product Name *</label>
          <input
            type="text"
            required
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground"
            placeholder="e.g., Gold Ring"
          />
        </div>

        <div>
          <label className="block text-foreground font-semibold mb-2">Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-foreground font-semibold mb-2">Gross Weight (g) *</label>
          <input
            type="number"
            step="0.1"
            required
            value={formData.gross_weight}
            onChange={(e) => setFormData({ ...formData, gross_weight: parseFloat(e.target.value) })}
            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-foreground font-semibold mb-2">Quantity *</label>
          <input
            type="number"
            required
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground"
            placeholder="1"
          />
        </div>

        <div>
          <label className="block text-foreground font-semibold mb-2">Purchase Price (₹) *</label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.purchase_price}
            onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-foreground font-semibold mb-2">Selling Price (₹)</label>
          <input
            type="number"
            step="0.01"
            value={formData.selling_price}
            onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) })}
            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-foreground font-semibold mb-2">Vendor *</label>
          <input
            type="text"
            required
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground"
            placeholder="Vendor name"
          />
        </div>

        <div>
          <label className="block text-foreground font-semibold mb-2">Storage Location *</label>
          <input
            type="text"
            required
            value={formData.storage_location}
            onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground"
            placeholder="e.g., Shelf A1"
          />
        </div>

        <div>
          <label className="block text-foreground font-semibold mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-foreground font-semibold mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground"
          placeholder="Additional notes..."
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-lg hover:bg-primary/90 transition font-bold disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Inventory'}
        </button>
      </div>
    </form>
  )
}