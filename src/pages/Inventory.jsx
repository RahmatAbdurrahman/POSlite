import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Package, AlertTriangle, Search } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { supabase } from '../config/supabase'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Modal from '../components/common/Modal'
import Alert from '../components/common/Alert'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCurrency } from '../utils/formatCurrency'

const Inventory = () => {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    getLowStockProducts,
  } = useProducts()

  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [restockingProduct, setRestockingProduct] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state untuk produk
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    stock: 0,
    stock_alert_level: 5,
    harga_beli: 0,
    harga_jual: 0,
  })

  // Form state untuk restock
  const [restockForm, setRestockForm] = useState({
    quantity: 0,
    harga_beli_baru: 0,
  })

  // Fetch categories
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  // Filter products
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockProducts = getLowStockProducts()

  // Handle form change
  const handleFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleRestockFormChange = (e) => {
    setRestockForm({
      ...restockForm,
      [e.target.name]: e.target.value,
    })
  }

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      category_id: '',
      stock: 0,
      stock_alert_level: 5,
      harga_beli: 0,
      harga_jual: 0,
    })
    setError('')
    setSuccess('')
    setShowProductModal(true)
  }

  // Open edit modal
  const handleOpenEditModal = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      category_id: product.category_id || '',
      stock: product.stock,
      stock_alert_level: product.stock_alert_level,
      harga_beli: product.harga_beli,
      harga_jual: product.harga_jual,
    })
    setError('')
    setSuccess('')
    setShowProductModal(true)
  }

  // Open restock modal
  const handleOpenRestockModal = (product) => {
    setRestockingProduct(product)
    setRestockForm({
      quantity: 0,
      harga_beli_baru: product.harga_beli,
    })
    setError('')
    setSuccess('')
    setShowRestockModal(true)
  }

  // Submit product form
  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    const productData = {
      ...productForm,
      stock: parseInt(productForm.stock),
      stock_alert_level: parseInt(productForm.stock_alert_level),
      harga_beli: parseFloat(productForm.harga_beli),
      harga_jual: parseFloat(productForm.harga_jual),
      category_id: productForm.category_id || null,
    }

    let result
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, productData)
    } else {
      result = await addProduct(productData)
    }

    if (result.success) {
      setSuccess(editingProduct ? 'Produk berhasil diupdate' : 'Produk berhasil ditambahkan')
      setTimeout(() => {
        setShowProductModal(false)
        setSuccess('')
      }, 1500)
    } else {
      setError(result.error)
    }

    setFormLoading(false)
  }

  // Submit restock
  const handleSubmitRestock = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    const result = await restockProduct(
      restockingProduct.id,
      restockForm.quantity,
      restockForm.harga_beli_baru
    )

    if (result.success) {
      setSuccess(`Berhasil menambah ${restockForm.quantity} stok`)
      setTimeout(() => {
        setShowRestockModal(false)
        setSuccess('')
      }, 1500)
    } else {
      setError(result.error)
    }

    setFormLoading(false)
  }

  // Delete product
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Hapus produk "${product.name}"?`)) return

    const result = await deleteProduct(product.id)
    if (result.success) {
      setSuccess('Produk berhasil dihapus')
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat produk..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
            Kelola Barang
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Manage inventaris dan stok produk Anda
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={handleOpenAddModal}
        >
          Tambah Produk
        </Button>
      </div>

      {/* Alerts */}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Alert
          type="warning"
          title={`⚠️ ${lowStockProducts.length} Produk Stok Menipis`}
          message="Beberapa produk memiliki stok di bawah batas minimum. Segera lakukan restock."
        />
      )}

      {/* Search Bar */}
      <div className="card p-4">
        <Input
          type="text"
          placeholder="Cari produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Products Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-head">
              <tr>
                <th className="table-th">Produk</th>
                <th className="table-th">Kategori</th>
                <th className="table-th">Stok</th>
                <th className="table-th">HPP</th>
                <th className="table-th">Harga Jual</th>
                <th className="table-th">Margin</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Belum ada produk
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const margin = ((product.harga_jual - product.harga_beli) / product.harga_jual * 100).toFixed(1)
                  const isLowStock = product.stock <= product.stock_alert_level

                  return (
                    <tr key={product.id} className="table-row-hover">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">📦</span>
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className="badge badge-info">
                          {product.categories?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className={`badge ${isLowStock ? 'badge-warning' : 'badge-success'}`}>
                          {product.stock} unit
                        </span>
                      </td>
                      <td className="table-td font-medium">
                        {formatCurrency(product.harga_beli)}
                      </td>
                      <td className="table-td font-semibold text-light-accent dark:text-dark-accent">
                        {formatCurrency(product.harga_jual)}
                      </td>
                      <td className="table-td">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {margin}%
                        </span>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenRestockModal(product)}
                            icon={<Package className="w-4 h-4" />}
                          >
                            Restock
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(product)}
                            icon={<Edit className="w-4 h-4" />}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            icon={<Trash2 className="w-4 h-4 text-red-500" />}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => !formLoading && setShowProductModal(false)}
        title={editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmitProduct} className="space-y-4">
          <Input
            label="Nama Produk"
            name="name"
            value={productForm.name}
            onChange={handleFormChange}
            placeholder="Contoh: Indomie Goreng"
            required
          />

          <div>
            <label className="label">Kategori</label>
            <select
              name="category_id"
              value={productForm.category_id}
              onChange={handleFormChange}
              className="input-field"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stok Awal"
              type="number"
              name="stock"
              value={productForm.stock}
              onChange={handleFormChange}
              placeholder="0"
              required
            />
            <Input
              label="Batas Stok Minimum"
              type="number"
              name="stock_alert_level"
              value={productForm.stock_alert_level}
              onChange={handleFormChange}
              placeholder="5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Harga Beli (HPP)"
              type="number"
              name="harga_beli"
              value={productForm.harga_beli}
              onChange={handleFormChange}
              placeholder="0"
              required
            />
            <Input
              label="Harga Jual"
              type="number"
              name="harga_jual"
              value={productForm.harga_jual}
              onChange={handleFormChange}
              placeholder="0"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowProductModal(false)}
              disabled={formLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={formLoading}
            >
              {editingProduct ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Restock Modal */}
      <Modal
        isOpen={showRestockModal}
        onClose={() => !formLoading && setShowRestockModal(false)}
        title={`Restock: ${restockingProduct?.name}`}
        size="md"
      >
        <form onSubmit={handleSubmitRestock} className="space-y-4">
          <div className="card p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Stok Saat Ini:</span>
              <span className="font-semibold">{restockingProduct?.stock} unit</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">HPP Saat Ini:</span>
              <span className="font-semibold">{formatCurrency(restockingProduct?.harga_beli)}</span>
            </div>
          </div>

          <Input
            label="Jumlah Tambah Stok"
            type="number"
            name="quantity"
            value={restockForm.quantity}
            onChange={handleRestockFormChange}
            placeholder="0"
            required
            min="1"
          />

          <Input
            label="Harga Beli Baru (per unit)"
            type="number"
            name="harga_beli_baru"
            value={restockForm.harga_beli_baru}
            onChange={handleRestockFormChange}
            placeholder="0"
            required
          />

          <Alert
            type="info"
            message="HPP akan dihitung otomatis menggunakan metode Weighted Average."
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowRestockModal(false)}
              disabled={formLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={formLoading}
            >
              Konfirmasi Restock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Inventory