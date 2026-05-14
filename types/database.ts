export interface User {
  id: string
  tenant_id: string
  role: 'super_admin' | 'owner' | 'staff'
  permissions: string[]
  created_at: string
}

export interface Tenant {
  id: string
  business_name: string
  subscription_plan: string
  expiry_date: string
  session_limits: number
  created_at: string
}

export interface Inventory {
  id: string
  tenant_id: string
  product_name: string
  category: string
  gross_weight: number
  quantity: number
  purchase_price: number
  selling_price?: number
  vendor: string
  storage_location: string
  notes: string
  status: string
  created_by: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface InventoryImage {
  id: string
  inventory_id: string
  image_url: string
  created_at: string
}

export interface AuditLog {
  id: string
  tenant_id: string
  inventory_reference: string
  mismatch_type: string
  severity: 'green' | 'yellow' | 'orange' | 'red'
  notes: string
  created_by: string
  created_at: string
}

export interface ActivityLog {
  id: string
  tenant_id: string
  user_id: string
  action: string
  metadata: any
  created_at: string
}

export interface Subscription {
  tenant_id: string
  plan_type: 'monthly' | 'yearly'
  billing_cycle: string
  expiry_date: string
  status: string
}