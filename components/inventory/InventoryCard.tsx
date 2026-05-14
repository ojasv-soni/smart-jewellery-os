'use client'

import { Inventory } from '@/types/database'
import { Trash2, Edit } from 'lucide-react'

interface InventoryCardProps {
  item: Inventory
  onEdit: (item: Inventory) => void
  onDelete: (id: string) => void
}

export function InventoryCard({ item, onEdit, onDelete }: InventoryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-900/20 text-green-300'
      case 'Low Stock':
        return 'bg-yellow-900/20 text-yellow-300'
      case 'Out of Stock':
        return 'bg-red-900/20 text-red-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
      {/* Product Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Product Image</span>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground truncate">{item.product_name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{item.category}</p>

        {/* Status Badge */}
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getStatusColor(item.status)}`}>
          {item.status}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Quantity</span>
            <p className="text-foreground font-bold">{item.quantity}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Weight (g)</span>
            <p className="text-foreground font-bold">{item.gross_weight}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Purchase</span>
            <p className="text-foreground font-bold">₹{item.purchase_price}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Selling</span>
            <p className="text-foreground font-bold">₹{item.selling_price || '-'}</p>
          </div>
        </div>

        {/* Vendor & Location */}
        <div className="border-t border-border pt-3 mb-4 text-xs">
          <p className="text-muted-foreground">
            <span className="font-semibold">Vendor:</span> {item.vendor}
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold">Location:</span> {item.storage_location}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 bg-primary text-primary-foreground py-2 px-3 rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 text-sm"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="flex-1 bg-destructive/20 text-destructive py-2 px-3 rounded-lg hover:bg-destructive/30 transition flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}