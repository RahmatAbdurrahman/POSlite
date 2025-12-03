import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],

  // Tambah produk ke keranjang
  addItem: (product) => {
    const items = get().items
    const existingItem = items.find((item) => item.product_id === product.id)

    if (existingItem) {
      // Jika sudah ada, tambah quantity
      set({
        items: items.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      })
    } else {
      // Jika belum ada, tambahkan item baru
      set({
        items: [
          ...items,
          {
            product_id: product.id,
            name: product.name,
            harga_jual: product.harga_jual,
            harga_beli: product.harga_beli,
            quantity: 1,
            stock: product.stock,
          },
        ],
      })
    }
  },

  // Update quantity
  updateQuantity: (product_id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(product_id)
      return
    }

    set({
      items: get().items.map((item) =>
        item.product_id === product_id ? { ...item, quantity } : item
      ),
    })
  },

  // Hapus item dari keranjang
  removeItem: (product_id) => {
    set({
      items: get().items.filter((item) => item.product_id !== product_id),
    })
  },

  // Clear keranjang
  clearCart: () => {
    set({ items: [] })
  },

  // Get total
  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.harga_jual * item.quantity,
      0
    )
  },

  // Get item count
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  },
}))