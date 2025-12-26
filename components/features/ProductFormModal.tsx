'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Card'
import { X, Package, DollarSign, Tag, AlertCircle } from 'lucide-react'
import type { Product } from '@/lib/types/database.types'
import toast from 'react-hot-toast'

interface ProductFormModalProps {
  product: Product | null
  isEditMode: boolean
  userId: string
  onClose: () => void
  onSaved: () => void
}

export default function ProductFormModal({
  product,
  isEditMode,
  userId,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    harga_beli: '',
    harga_jual: '',
    stock: '',
    stock_alert_level: '',
    image_url: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (product && isEditMode) {
      setFormData({
        name: product.name,
        harga_beli: product.harga_beli.toString(),
        harga_jual: product.harga_jual.toString(),
        stock: product.stock.toString(),
        stock_alert_level: product.stock_alert_level.toString(),
        image_url: product.image_url || '',
      })
    }
  }, [product, isEditMode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error saat user mulai mengetik
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nama produk wajib diisi'
    }

    const hargaBeli = parseFloat(formData.harga_beli)
    if (!formData.harga_beli || isNaN(hargaBeli) || hargaBeli <= 0) {
      newErrors.harga_beli = 'Harga beli harus lebih dari 0'
    }

    const hargaJual = parseFloat(formData.harga_jual)
    if (!formData.harga_jual || isNaN(hargaJual) || hargaJual <= 0) {
      newErrors.harga_jual = 'Harga jual harus lebih dari 0'
    }

    if (hargaJual <= hargaBeli) {
      newErrors.harga_jual = 'Harga jual harus lebih tinggi dari harga beli'
    }

    if (!isEditMode) {
      const stock = parseInt(formData.stock)
      if (!formData.stock || isNaN(stock) || stock < 0) {
        newErrors.stock = 'Stok tidak valid'
      }
    }

    const alertLevel = parseInt(formData.stock_alert_level)
    if (!formData.stock_alert_level || isNaN(alertLevel) || alertLevel < 0) {
      newErrors.stock_alert_level = 'Level alert tidak valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Mohon perbaiki kesalahan pada form')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const productData = {
        user_id: userId,
        name: formData.name.trim(),
        harga_beli: parseFloat(formData.harga_beli),
        harga_jual: parseFloat(formData.harga_jual),
        stock_alert_level: parseInt(formData.stock_alert_level),
        image_url: formData.image_url.trim() || null,
      }

      if (isEditMode && product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)

        if (error) throw error
        toast.success('Produk berhasil diupdate')
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            ...productData,
            stock: parseInt(formData.stock),
          })

        if (error) throw error
        toast.success('Produk berhasil ditambahkan')
      }

      onSaved()
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(error.message || 'Gagal menyimpan produk')
    } finally {
      setLoading(false)
    }
  }

  const profitMargin = (() => {
    const beli = parseFloat(formData.harga_beli)
    const jual = parseFloat(formData.harga_jual)
    if (isNaN(beli) || isNaN(jual) || beli === 0) return 0
    return ((jual - beli) / beli) * 100
  })()

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-800 rounded-neo shadow-neo-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nama Produk */}
          <Input
            label="Nama Produk"
            name="name"
            placeholder="Contoh: Indomie Goreng"
            value={formData.name}
            onChange={handleChange}
            leftIcon={<Package size={18} />}
            error={errors.name}
            required
            disabled={loading}
          />

          {/* Harga Beli & Harga Jual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Harga Beli (HPP)"
              name="harga_beli"
              type="number"
              placeholder="5000"
              value={formData.harga_beli}
              onChange={handleChange}
              leftIcon={<DollarSign size={18} />}
              error={errors.harga_beli}
              required
              disabled={loading}
            />

            <Input
              label="Harga Jual"
              name="harga_jual"
              type="number"
              placeholder="7000"
              value={formData.harga_jual}
              onChange={handleChange}
              leftIcon={<Tag size={18} />}
              error={errors.harga_jual}
              required
              disabled={loading}
            />
          </div>

          {/* Profit Margin Display */}
          {profitMargin > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-neo border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700 dark:text-green-400">
                  Profit Margin
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  +{profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Stok & Alert Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isEditMode && (
              <Input
                label="Stok Awal"
                name="stock"
                type="number"
                placeholder="100"
                value={formData.stock}
                onChange={handleChange}
                leftIcon={<Package size={18} />}
                error={errors.stock}
                helperText="Stok awal produk"
                required
                disabled={loading}
              />
            )}

            <Input
              label="Level Alert Stok"
              name="stock_alert_level"
              type="number"
              placeholder="10"
              value={formData.stock_alert_level}
              onChange={handleChange}
              leftIcon={<AlertCircle size={18} />}
              error={errors.stock_alert_level}
              helperText="Notifikasi saat stok mencapai level ini"
              required
              disabled={loading}
            />
          </div>

          {isEditMode && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-neo border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                💡 Untuk mengubah stok, gunakan fitur <strong>Restock</strong> agar HPP ter-update otomatis
              </p>
            </div>
          )}

          {/* Image URL (Optional) */}
          <Input
            label="URL Gambar (Opsional)"
            name="image_url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.image_url}
            onChange={handleChange}
            helperText="Link gambar produk dari internet"
            disabled={loading}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              {isEditMode ? 'Update Produk' : 'Tambah Produk'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}