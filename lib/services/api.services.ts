import { createClient } from '@/lib/supabase/client'
import type { 
  Product, 
  Transaction, 
  TransactionItem, 
  StockIn,
  Profile,
  InsertTables,
  CartItem
} from '@/lib/types/database.types'

const supabase = createClient()

// ========== PRODUCTS ==========
export const productsService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Product[]
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Product
  },

  async getLowStock(userId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .filter('stock', 'lte', 'stock_alert_level')
      .order('stock', { ascending: true })
    
    if (error) throw error
    return data as Product[]
  },

  async create(product: InsertTables<'products'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()
    
    if (error) throw error
    return data as Product
  },

  async update(id: number, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Product
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async search(userId: string, query: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${query}%`)
      .order('name')
    
    if (error) throw error
    return data as Product[]
  },
}

// ========== TRANSACTIONS ==========
export const transactionsService = {
  async getAll(userId: string, limit?: number) {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        transaction_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (limit) query = query.limit(limit)
    
    const { data, error } = await query
    
    if (error) throw error
    return data as any[] // Extended type dengan relations
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        transaction_items (
          *,
          products (*)
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(userId: string, cartItems: CartItem[]) {
    // Panggil Edge Function handle-checkout
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
    return data
  },

  async getTodayStats(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('transactions')
      .select('total_amount, total_hpp')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())

    if (error) throw error

    const revenue = data.reduce((sum, t) => sum + t.total_amount, 0)
    const hpp = data.reduce((sum, t) => sum + t.total_hpp, 0)

    return {
      revenue,
      profit: revenue - hpp,
      count: data.length,
    }
  },

  async getMonthlyStats(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const { data, error } = await supabase
      .from('transactions')
      .select('total_amount, total_hpp, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) throw error

    return data
  },
}

// ========== STOCK INS ==========
export const stockInsService = {
  async getAll(userId: string, productId?: number) {
    let query = supabase
      .from('stock_ins')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (productId) query = query.eq('product_id', productId)
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async create(userId: string, productId: number, quantity: number, hargaBeliBaru: number) {
    // Panggil Edge Function handle-restock
    const { data, error } = await supabase.functions.invoke('handle-restock', {
      body: {
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        harga_beli_baru: hargaBeliBaru,
      },
    })

    if (error) throw error
    return data
  },
}

// ========== PROFILES ==========
export const profilesService = {
  async get(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data as Profile
  },

  async update(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data as Profile
  },
}

// ========== REALTIME SUBSCRIPTIONS ==========
export const realtimeService = {
  subscribeToProducts(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()
  },

  subscribeToTransactions(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()
  },

  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    return supabase.removeChannel(channel)
  },
}