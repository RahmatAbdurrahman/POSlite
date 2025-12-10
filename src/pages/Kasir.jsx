import React, { useState, useMemo } from 'react'
import { Search, ShoppingCart, Plus, Minus, Trash2, DollarSign } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useTransactions } from '../hooks/useTransactions'
import { useCartStore } from '../store/cartStore'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Alert from '../components/common/Alert'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCurrency } from '../utils/formatCurrency'
import { celebrationConfetti } from '../utils/animations'

const Kasir = () => {
  const { products, loading: productsLoading } = useProducts()
  const { checkout } = useTransactions()
  const { items, addItem, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [error, setError] = useState('')

  // Filter products berdasarkan search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products
    const query = searchQuery.toLowerCase()
    return products.filter(p => 
      p.name.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      setError('Produk ini stoknya habis')
      return
    }
    addItem(product)
  }

  // Handle checkout
  const handleCheckout = async () => {
    if (items.length === 0) return

    setCheckoutLoading(true)
    setError('')

    const { success, error: checkoutError } = await checkout(items)

    if (success) {
      setCheckoutSuccess(true)
      celebrationConfetti()
      setTimeout(() => {
        clearCart()
        setShowCheckoutModal(false)
        setCheckoutSuccess(false)
      }, 2000)
    } else {
      setError(checkoutError)
    }

    setCheckoutLoading(false)
  }

  if (productsLoading) {
    return <LoadingSpinner fullScreen text="Memuat produk..." />
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="card p-4 mb-4">
          <Input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Tidak ada produk ditemukan
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className={`
                    card p-4 text-left hover-scale
                    ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
                  `}
                >
                  {/* Product Image */}
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-24 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-3xl">📦</span>
                    </div>
                  )}

                  {/* Product Info */}
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-light-accent dark:text-dark-accent mb-2">
                    {formatCurrency(product.harga_jual)}
                  </p>
                  
                  {/* Stock Badge */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`badge ${
                      product.stock <= product.stock_alert_level 
                        ? 'badge-warning' 
                        : 'badge-success'
                    }`}>
                      Stok: {product.stock}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="lg:w-96 flex flex-col card p-4">
        {/* Cart Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-light-accent dark:text-dark-accent" />
            Keranjang
          </h2>
          <span className="badge badge-info">{getItemCount()} item</span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Keranjang masih kosong
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product_id} className="card-hover p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="text-light-accent dark:text-dark-accent font-semibold">
                      {formatCurrency(item.harga_jual)}
                    </p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold">
                    Subtotal: {formatCurrency(item.harga_jual * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-2xl font-bold">
            <span>Total:</span>
            <span className="text-light-accent dark:text-dark-accent">
              {formatCurrency(getTotal())}
            </span>
          </div>
          
          <Button
            variant="primary"
            fullWidth
            size="lg"
            disabled={items.length === 0}
            onClick={() => setShowCheckoutModal(true)}
            icon={<DollarSign className="w-5 h-5" />}
          >
            Bayar Sekarang
          </Button>
          
          {items.length > 0 && (
            <Button
              variant="ghost"
              fullWidth
              onClick={clearCart}
            >
              Kosongkan Keranjang
            </Button>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => !checkoutLoading && setShowCheckoutModal(false)}
        title="Konfirmasi Pembayaran"
        size="md"
      >
        {checkoutSuccess ? (
          <Alert
            type="success"
            title="Transaksi Berhasil! 🎉"
            message="Pembayaran telah diterima dan stok telah diperbarui."
          />
        ) : (
          <>
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
                className="mb-4"
              />
            )}

            <div className="space-y-4">
              <div className="card p-4 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold mb-3">Ringkasan Pembelian</h3>
                <div className="space-y-2 text-sm">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex justify-between">
                      <span>{item.name} (x{item.quantity})</span>
                      <span className="font-semibold">
                        {formatCurrency(item.harga_jual * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-lg font-bold">
                  <span>Total Bayar:</span>
                  <span className="text-light-accent dark:text-dark-accent">
                    {formatCurrency(getTotal())}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowCheckoutModal(false)}
                  disabled={checkoutLoading}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={checkoutLoading}
                  onClick={handleCheckout}
                >
                  Konfirmasi Bayar
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default Kasir