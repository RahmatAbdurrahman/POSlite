'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Card'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  PackagePlus
} from 'lucide-react'
import { 
  formatCurrency, 
  getStockStatus, 
  getStockStatusColor,
  getStockStatusLabel,
  calculateProfitMargin,
  debounce
} from '@/lib/utils'
import type { Product } from '@/lib/types/database.types'
import toast from 'react-hot-toast'
import ProductFormModal from '@/components/features/ProductFormModal'
import RestockModal from '@/components/features/RestockModal'

export default function InventarisPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [userId, setUserId] = useState<string>('')

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
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Gagal memuat produk')
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [products, searchQuery])

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value)
  }, 300)

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsEditMode(false)
    setShowProductModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsEditMode(true)
    setShowProductModal(true)
  }

  const handleRestock = (product: Product) => {
    setSelectedProduct(product)
    setShowRestockModal(true)
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Hapus produk "${product.name}"?`)) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) throw error

      toast.success('Produk berhasil dihapus')
      loadProducts()
    } catch (error: any) {
      console.error('Error deleting product:', error)
      toast.error(error.message || 'Gagal menghapus produk')
    }
  }

  const handleProductSaved = () => {
    setShowProductModal(false)
    loadProducts()
  }

  const handleRestockComplete = () => {
    setShowRestockModal(false)
    loadProducts()
  }

  // Calculate stats
  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.harga_jual), 0)
    const lowStockCount = products.filter(p => getStockStatus(p.stock, p.stock_alert_level) !== 'normal').length
    const outOfStockCount = products.filter(p => p.stock === 0).length

    return { totalProducts, totalValue, lowStockCount, outOfStockCount }
  }, [products])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-neo flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Total Produk
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.totalProducts}
            </h3>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-neo flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Nilai Inventaris
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency(stats.totalValue)}
            </h3>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-neo flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Stok Menipis
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.lowStockCount}
            </h3>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-neo flex items-center justify-center">
                <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Stok Habis
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.outOfStockCount}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Cari produk..."
                leftIcon={<Search size={18} />}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              leftIcon={<Plus size={20} />}
              onClick={handleAddProduct}
            >
              Tambah Produk
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Produk
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Stok
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    HPP
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Harga Jual
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Profit Margin
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.stock_alert_level)
                  const profitMargin = calculateProfitMargin(product.harga_jual, product.harga_beli)

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-neo"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-neo flex items-center justify-center">
                              <Package className="w-6 h-6 text-neutral-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {product.name}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              ID: {product.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-neutral-700 dark:text-neutral-300">
                        {formatCurrency(product.harga_beli)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-neutral-900 dark:text-white">
                        {formatCurrency(product.harga_jual)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          +{profitMargin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStockStatusColor(stockStatus)}`}>
                            {getStockStatusLabel(stockStatus)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleRestock(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-neo transition-colors"
                            title="Restock"
                          >
                            <PackagePlus size={18} />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/30 rounded-neo transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-neo transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                </p>
                {!searchQuery && (
                  <Button
                    variant="primary"
                    className="mt-4"
                    leftIcon={<Plus size={18} />}
                    onClick={handleAddProduct}
                  >
                    Tambah Produk Pertama
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showProductModal && (
        <ProductFormModal
          product={selectedProduct}
          isEditMode={isEditMode}
          userId={userId}
          onClose={() => setShowProductModal(false)}
          onSaved={handleProductSaved}
        />
      )}

      {showRestockModal && selectedProduct && (
        <RestockModal
          product={selectedProduct}
          userId={userId}
          onClose={() => setShowRestockModal(false)}
          onComplete={handleRestockComplete}
        />
      )}
    </div>
  )
}