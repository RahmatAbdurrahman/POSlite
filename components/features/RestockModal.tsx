'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Card'
import { X, PackagePlus, DollarSign, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/lib/types/database.types'
import toast from 'react-hot-toast'

interface RestockModalProps {
  product: Product
  userId: string
  onClose: () => void
  onComplete: () => void
}

export default function RestockModal({
  product,
  userId,
  onClose,
  onComplete,
}: RestockModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    quantity: '',
    harga_beli_baru: product.harga_beli.toString(),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
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

    const quantity = parseInt(formData.quantity)
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = 'Jumlah harus lebih dari 0'
    }

    const hargaBeliBaru = parseFloat(formData.harga_beli_baru)
    if (!formData.harga_beli_baru || isNaN(hargaBeliBaru) || hargaBeliBaru <= 0) {
      newErrors.harga_beli_baru = 'Harga beli harus lebih dari 0'
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

      // Call Edge Function handle-restock
      const { data, error } = await supabase.functions.invoke('handle-restock', {
        body: {
          user_id: userId,
          product_id: product.id,
          quantity: parseInt(formData.quantity),
          harga_beli_baru: parseFloat(formData.harga_beli_baru),
        },
      })

      if (error) throw error

      toast.success('Restock berhasil! HPP telah diperbarui 📦', { duration: 5000 })
      onComplete()
    } catch (error: any) {
      console.error('Error restocking:', error)
      toast.error(error.message || 'Gagal melakukan restock')
    } finally {
      setLoading(false)
    }
  }

  // Calculate new HPP (Weighted Average)
  const newHPP = (() => {
    const quantity = parseInt(formData.quantity)
    const hargaBeliBaru = parseFloat(formData.harga_beli_baru)
    
    if (isNaN(quantity) || isNaN(hargaBeliBaru) || quantity <= 0) {
      return product.harga_beli
    }

    const currentValue = product.stock * product.harga_beli
    const newValue = quantity * hargaBeliBaru
    const totalStock = product.stock + quantity
    
    return (currentValue + newValue) / totalStock
  })()

  const hppChange = newHPP - product.harga_beli
  const hppChangePercent = product.harga_beli > 0 ? (hppChange / product.harga_beli) * 100 : 0

  const newProfitMargin = product.harga_jual > 0 
    ? ((product.harga_jual - newHPP) / newHPP) * 100 
    : 0

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-800 rounded-neo shadow-neo-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Restock Produk
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {product.name}
            </p>
          </div>
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
          {/* Current Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-neo">
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                Stok Saat Ini
              </p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {product.stock}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                HPP Saat Ini
              </p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {formatCurrency(product.harga_beli)}
              </p>
            </div>
          </div>

          {/* Quantity */}
          <Input
            label="Jumlah Restock"
            name="quantity"
            type="number"
            placeholder="50"
            value={formData.quantity}
            onChange={handleChange}
            leftIcon={<PackagePlus size={18} />}
            error={errors.quantity}
            helperText="Jumlah unit yang ditambahkan"
            required
            disabled={loading}
          />

          {/* New Purchase Price */}
          <Input
            label="Harga Beli Baru"
            name="harga_beli_baru"
            type="number"
            placeholder="5000"
            value={formData.harga_beli_baru}
            onChange={handleChange}
            leftIcon={<DollarSign size={18} />}
            error={errors.harga_beli_baru}
            helperText="Harga beli per unit pada pembelian ini"
            required
            disabled={loading}
          />

          {/* HPP Calculation Preview */}
          {formData.quantity && formData.harga_beli_baru && (
            <div className="space-y-3">
              {/* New HPP */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-neo border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    HPP Baru (Weighted Average)
                  </span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(newHPP)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <TrendingUp size={14} className={hppChange >= 0 ? 'text-red-500' : 'text-green-500'} />
                  <span className={hppChange >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {hppChange >= 0 ? '+' : ''}{formatCurrency(hppChange)} ({hppChangePercent >= 0 ? '+' : ''}{hppChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Calculation Details */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-neo space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Nilai Stok Lama
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(product.stock * product.harga_beli)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Nilai Pembelian Baru
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(parseInt(formData.quantity || '0') * parseFloat(formData.harga_beli_baru || '0'))}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Total Stok Baru
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {product.stock + parseInt(formData.quantity || '0')}
                  </span>
                </div>
              </div>

              {/* Profit Margin After Restock */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-neo border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Profit Margin Setelah Restock
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                      Harga Jual: {formatCurrency(product.harga_jual)}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    +{newProfitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Warning if HPP increases significantly */}
              {hppChangePercent > 10 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-neo border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    ⚠️ HPP meningkat signifikan (+{hppChangePercent.toFixed(1)}%). 
                    Pertimbangkan untuk menyesuaikan harga jual agar profit margin tetap optimal.
                  </p>
                </div>
              )}
            </div>
          )}

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
              leftIcon={<PackagePlus size={18} />}
            >
              Konfirmasi Restock
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}