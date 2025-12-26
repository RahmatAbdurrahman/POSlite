'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/stores/cart-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Card'
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  DollarSign,
  Package,
  CheckCircle2
} from 'lucide-react'
import { formatCurrency, debounce } from '@/lib/utils'
import type { Product } from '@/lib/types/database.types'
import toast from 'react-hot-toast'

export default function KasirPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [userId, setUserId] = useState<string>('')

  const {
    items: cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalAmount,
    getTotalHPP,
    getProfit,
    getTotalItems,
  } = useCartStore()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return
      setUserId(user.id)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .gt('stock', 0) // Only show products with stock
        .order('name')

      if (error) throw error
      setProducts(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Gagal memuat produk')
      setLoading(false)
    }
  }

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [products, searchQuery])

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value)
  }, 300)

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.product.id === product.id)
    
    if (existingItem && existingItem.quantity >= product.stock) {
      toast.error(`Stok ${product.name} tidak mencukupi`)
      return
    }

    addItem(product, 1)
    toast.success(`${product.name} ditambahkan`, { icon: '🛒' })
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Keranjang masih kosong')
      return
    }

    setCheckoutLoading(true)

    try {
      const supabase = createClient()

      // Call Edge Function to handle checkout
      const { data, error } = await supabase.functions.invoke('handle-checkout', {
        body: {
          user_id: userId,
          items: cartItems.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            harga_jual: item.product.harga_jual,
            harga_beli: item.product.harga_beli,
          })),
        },
      })

      if (error) throw error

      toast.success('Transaksi berhasil! 🎉', { duration: 5000 })
      clearCart()
      loadProducts() // Reload to update stock
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Gagal memproses transaksi')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products List */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <Input
              placeholder="Cari produk..."
              leftIcon={<Search size={18} />}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const cartItem = cartItems.find(item => item.product.id === product.id)
            const remainingStock = product.stock - (cartItem?.quantity || 0)

            return (
              <Card
                key={product.id}
                hover
                className="cursor-pointer"
                onClick={() => handleAddToCart(product)}
              >
                <CardContent className="p-4">
                  {/* Product Image */}
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-neo-sm mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-neutral-200 dark:bg-neutral-700 rounded-neo-sm mb-3 flex items-center justify-center">
                      <Package className="w-12 h-12 text-neutral-400" />
                    </div>
                  )}

                  {/* Product Info */}
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 truncate">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(product.harga_jual)}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Stok: {remainingStock}
                    </span>
                  </div>

                  {/* Add Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    leftIcon={<Plus size={16} />}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(product)
                    }}
                    disabled={remainingStock === 0}
                  >
                    {remainingStock === 0 ? 'Stok Habis' : 'Tambah'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-500 dark:text-neutral-400">
                {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cart */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={20} />
              Keranjang ({getTotalItems()})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3 max-h-100 overflow-y-auto">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-neo"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatCurrency(item.product.harga_jual)} × {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded text-neutral-700 dark:text-neutral-300"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded text-neutral-700 dark:text-neutral-300"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="w-full py-1 flex items-center justify-center bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded text-red-600 dark:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {cartItems.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Keranjang kosong
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            {cartItems.length > 0 && (
              <>
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Total Item
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {getTotalItems()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      HPP
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {formatCurrency(getTotalHPP())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Profit
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(getProfit())}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-900 dark:text-white">Total</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      {formatCurrency(getTotalAmount())}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<CheckCircle2 size={20} />}
                    onClick={handleCheckout}
                    loading={checkoutLoading}
                  >
                    Checkout
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    leftIcon={<Trash2 size={18} />}
                    onClick={clearCart}
                    disabled={checkoutLoading}
                  >
                    Kosongkan Keranjang
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}