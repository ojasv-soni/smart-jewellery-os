import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: any | null
  tenant: any | null
  setUser: (user: any) => void
  setTenant: (tenant: any) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      setUser: (user) => set({ user }),
      setTenant: (tenant) => set({ tenant }),
      logout: () => set({ user: null, tenant: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface InventoryState {
  inventory: any[]
  setInventory: (inventory: any[]) => void
  addItem: (item: any) => void
  updateItem: (id: string, item: any) => void
  deleteItem: (id: string) => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
  inventory: [],
  setInventory: (inventory) => set({ inventory }),
  addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  updateItem: (id, item) => set((state) => ({
    inventory: state.inventory.map((i) => i.id === id ? { ...i, ...item } : i)
  })),
  deleteItem: (id) => set((state) => ({
    inventory: state.inventory.filter((i) => i.id !== id)
  })),
}))