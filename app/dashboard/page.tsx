'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle,
  Package,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

// Dynamic import untuk ApexCharts (client-side only)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface DashboardStats {
  today_revenue: number
  today_profit: number
  today_transactions: number
  low_stock_count: number
  total_products: number
  revenue_trend: number
}

interface RecentTransaction {
  id: number
  total_amount: number
  created_at: string
}

interface LowStockProduct {
  id: number
  name: string
  stock: number
  stock_alert_level: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    today_revenue: 0,
    today_profit: 0,
    today_transactions: 0,
    low_stock_count: 0,
    total_products: 0,
    revenue_trend: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    loadDashboardData()

    // Setup realtime subscriptions
    const supabase = createClient()
    
    const transactionChannel = supabase
      .channel('dashboard-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
        () => {
          loadDashboardData()
          toast.success('Transaksi baru masuk!', { icon: '🛒' })
        }
      )
      .subscribe()

    const productChannel = supabase
      .channel('dashboard-products')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
        },
        () => {
          loadDashboardData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(transactionChannel)
      supabase.removeChannel(productChannel)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Get today's transactions
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: todayTransactions } = await supabase
        .from('transactions')
        .select('total_amount, total_hpp, created_at')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())

      const todayRevenue = todayTransactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0
      const todayHPP = todayTransactions?.reduce((sum, t) => sum + t.total_hpp, 0) || 0

      // Get yesterday's revenue for trend
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const { data: yesterdayTransactions } = await supabase
        .from('transactions')
        .select('total_amount')
        .eq('user_id', user.id)
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString())

      const yesterdayRevenue = yesterdayTransactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0
      const revenueTrend = yesterdayRevenue > 0 
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
        : 0

      // Get low stock products
      const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, stock, stock_alert_level')
        .eq('user_id', user.id)
        .order('stock', { ascending: true })

      const lowStock = allProducts
        ?.filter(p => p.stock <= p.stock_alert_level)
        .slice(0, 5) || []

      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get recent transactions
      const { data: recent } = await supabase
        .from('transactions')
        .select('id, total_amount, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Get last 7 days data for chart
      const last7Days = new Date()
      last7Days.setDate(last7Days.getDate() - 7)

      const { data: weekTransactions } = await supabase
        .from('transactions')
        .select('total_amount, total_hpp, created_at')
        .eq('user_id', user.id)
        .gte('created_at', last7Days.toISOString())
        .order('created_at', { ascending: true })

      // Process chart data
      const dailyData: { [key: string]: { revenue: number, profit: number } } = {}
      
      weekTransactions?.forEach(t => {
        const date = new Date(t.created_at).toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'short' 
        })
        if (!dailyData[date]) {
          dailyData[date] = { revenue: 0, profit: 0 }
        }
        dailyData[date].revenue += t.total_amount
        dailyData[date].profit += (t.total_amount - t.total_hpp)
      })

      const chartOptions = {
        chart: {
          type: 'area',
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
          categories: Object.keys(dailyData),
        },
        colors: ['#22C55E', '#3B82F6'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1,
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => formatCurrency(val),
          },
        },
      }

      const chartSeries = [
        {
          name: 'Pendapatan',
          data: Object.values(dailyData).map(d => d.revenue),
        },
        {
          name: 'Profit',
          data: Object.values(dailyData).map(d => d.profit),
        },
      ]

      setStats({
        today_revenue: todayRevenue,
        today_profit: todayRevenue - todayHPP,
        today_transactions: todayTransactions?.length || 0,
        low_stock_count: lowStock?.length || 0,
        total_products: totalProducts || 0,
        revenue_trend: revenueTrend,
      })

      setRecentTransactions(recent || [])
      setLowStockProducts(lowStock || [])
      setChartData({ options: chartOptions, series: chartSeries })
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Gagal memuat data dashboard')
      setLoading(false)
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today Revenue */}
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-neo flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stats.revenue_trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenue_trend >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {Math.abs(stats.revenue_trend).toFixed(1)}%
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Pendapatan Hari Ini
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency(stats.today_revenue)}
            </h3>
          </CardContent>
        </Card>

        {/* Today Profit */}
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-neo flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Profit Hari Ini
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency(stats.today_profit)}
            </h3>
          </CardContent>
        </Card>

        {/* Today Transactions */}
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-neo flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Transaksi Hari Ini
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.today_transactions}
            </h3>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-neo flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Stok Menipis
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.low_stock_count} Produk
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Grafik Pendapatan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData && (
              <Chart
                options={chartData.options}
                series={chartData.series}
                type="area"
                height={300}
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-neo"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      #{transaction.id}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(transaction.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {formatCurrency(transaction.total_amount)}
                  </p>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                  Belum ada transaksi hari ini
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle size={20} />
              Produk dengan Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-neo border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Alert Level: {product.stock_alert_level}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-xs font-semibold">
                    Stok: {product.stock}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}