import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { getTodayRange, getDateRange } from '../utils/helpers'

/**
 * Custom hook untuk mengelola transaksi
 */
export const useTransactions = (dateRange = null) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalHpp: 0,
    totalProfit: 0,
    totalTransactions: 0,
  })

  // Fetch transaksi
  const fetchTransactions = async (customDateRange = null) => {
    try {
      setLoading(true)
      const range = customDateRange || dateRange || getTodayRange()

      let query = supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            *,
            products (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      // Filter by date range jika ada
      if (range) {
        query = query
          .gte('created_at', range.start)
          .lte('created_at', range.end)
      }

      const { data, error } = await query

      if (error) throw error

      setTransactions(data || [])
      
      // Hitung statistik
      const totalAmount = data.reduce((sum, t) => sum + parseFloat(t.total_amount), 0)
      const totalHpp = data.reduce((sum, t) => sum + parseFloat(t.total_hpp), 0)
      
      setStats({
        totalAmount,
        totalHpp,
        totalProfit: totalAmount - totalHpp,
        totalTransactions: data.length,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Checkout - panggil Edge Function
  const checkout = async (cartItems) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/handle-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            cart_items: cartItems,
          }),
        }
      )

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Checkout gagal')
      }

      // Refresh transactions setelah checkout
      await fetchTransactions()
      
      return { success: true, data: result }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Get transaksi hari ini
  const getTodayTransactions = async () => {
    const today = getTodayRange()
    await fetchTransactions(today)
  }

  // Get transaksi by date range
  const getTransactionsByDateRange = async (startDate, endDate) => {
    const range = getDateRange(startDate, endDate)
    await fetchTransactions(range)
  }

  // Get top selling products
  const getTopProducts = async (limit = 5) => {
    try {
      const { data, error } = await supabase
        .from('transaction_items')
        .select(`
          product_id,
          quantity,
          products (
            name
          )
        `)

      if (error) throw error

      // Group by product dan hitung total quantity
      const productMap = {}
      data.forEach(item => {
        const id = item.product_id
        if (!productMap[id]) {
          productMap[id] = {
            product_id: id,
            name: item.products.name,
            total_quantity: 0,
          }
        }
        productMap[id].total_quantity += item.quantity
      })

      // Sort dan ambil top N
      const topProducts = Object.values(productMap)
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, limit)

      return { success: true, data: topProducts }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Setup real-time subscription
  const subscribeToTransactions = (callback) => {
    const subscription = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
        (payload) => {
          // Refresh data saat ada transaksi baru
          fetchTransactions()
          if (callback) callback(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return {
    transactions,
    loading,
    error,
    stats,
    fetchTransactions,
    checkout,
    getTodayTransactions,
    getTransactionsByDateRange,
    getTopProducts,
    subscribeToTransactions,
  }
}

export default useTransactions