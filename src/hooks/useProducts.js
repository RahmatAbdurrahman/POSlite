import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

/**
 * Custom hook untuk mengelola produk
 */
export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch semua produk
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Tambah produk baru
  const addProduct = async (productData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      
      setProducts([...products, data])
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Update produk
  const updateProduct = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setProducts(products.map(p => p.id === id ? data : p))
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Hapus produk
  const deleteProduct = async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(products.filter(p => p.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Restock produk (panggil Edge Function)
  const restockProduct = async (productId, quantity, hargaBeliBaru) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/handle-restock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            product_id: productId,
            quantity: parseInt(quantity),
            harga_beli_baru: parseFloat(hargaBeliBaru),
          }),
        }
      )

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Restock gagal')
      }

      // Refresh products setelah restock
      await fetchProducts()
      
      return { success: true, data: result }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Get produk by ID
  const getProductById = (id) => {
    return products.find(p => p.id === id)
  }

  // Get produk dengan stok rendah
  const getLowStockProducts = () => {
    return products.filter(p => p.stock <= p.stock_alert_level)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    getProductById,
    getLowStockProducts,
  }
}

export default useProducts