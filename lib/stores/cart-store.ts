import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/lib/types/database.types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalAmount: () => number
  getTotalHPP: () => number
  getTotalItems: () => number
  getProfit: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          )

          if (existingItem) {
            // Update quantity jika item sudah ada
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.quantity + quantity,
                        product.stock
                      ),
                      subtotal:
                        Math.min(item.quantity + quantity, product.stock) *
                        product.harga_jual,
                    }
                  : item
              ),
            }
          }

          // Tambah item baru
          const validQuantity = Math.min(quantity, product.stock)
          return {
            items: [
              ...state.items,
              {
                product,
                quantity: validQuantity,
                subtotal: validQuantity * product.harga_jual,
              },
            ],
          }
        })
      },

      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id === productId) {
              const validQuantity = Math.min(quantity, item.product.stock)
              return {
                ...item,
                quantity: validQuantity,
                subtotal: validQuantity * item.product.harga_jual,
              }
            }
            return item
          }),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.subtotal, 0)
      },

      getTotalHPP: () => {
        return get().items.reduce(
          (total, item) => total + item.quantity * item.product.harga_beli,
          0
        )
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getProfit: () => {
        return get().getTotalAmount() - get().getTotalHPP()
      },
    }),
    {
      name: 'poslite-cart-storage',
      // Hanya persist items, bukan methods
      partialize: (state) => ({ items: state.items }),
    }
  )
)