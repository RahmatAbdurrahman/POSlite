export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          business_name: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          business_name?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          business_name?: string | null
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: number
          user_id: string
          category_id: number | null
          name: string
          image_url: string | null
          stock: number
          stock_alert_level: number
          harga_beli: number
          harga_jual: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          category_id?: number | null
          name: string
          image_url?: string | null
          stock?: number
          stock_alert_level?: number
          harga_beli: number
          harga_jual: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          category_id?: number | null
          name?: string
          image_url?: string | null
          stock?: number
          stock_alert_level?: number
          harga_beli?: number
          harga_jual?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: number
          user_id: string
          total_amount: number
          total_hpp: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          total_amount: number
          total_hpp: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          total_amount?: number
          total_hpp?: number
          created_at?: string
        }
      }
      transaction_items: {
        Row: {
          id: number
          transaction_id: number
          product_id: number
          quantity: number
          harga_jual_saat_itu: number
          harga_beli_saat_itu: number
          created_at: string
        }
        Insert: {
          id?: number
          transaction_id: number
          product_id: number
          quantity: number
          harga_jual_saat_itu: number
          harga_beli_saat_itu: number
          created_at?: string
        }
        Update: {
          id?: number
          transaction_id?: number
          product_id?: number
          quantity?: number
          harga_jual_saat_itu?: number
          harga_beli_saat_itu?: number
          created_at?: string
        }
      }
      stock_ins: {
        Row: {
          id: number
          user_id: string
          product_id: number
          quantity: number
          harga_beli_baru: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          quantity: number
          harga_beli_baru: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          quantity?: number
          harga_beli_baru?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper Types
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// Specific Types
export type Product = Tables<'products'>
export type Transaction = Tables<'transactions'>
export type TransactionItem = Tables<'transaction_items'>
export type StockIn = Tables<'stock_ins'>
export type Profile = Tables<'profiles'>

// Extended Types untuk UI
export interface ProductWithDetails extends Product {
  profit_margin?: number
  stock_status?: 'normal' | 'low' | 'out'
}

export interface TransactionWithItems extends Transaction {
  items: (TransactionItem & {
    product: Product
  })[]
  profit: number
  profit_margin: number
}

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

export interface DashboardStats {
  today_revenue: number
  today_profit: number
  today_transactions: number
  low_stock_count: number
  total_products: number
  month_revenue: number
  month_profit: number
}