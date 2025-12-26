'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { 
  Calendar,
  Download,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface Transaction {
  id: number
  total_amount: number
  total_hpp: number
  created_at: string
}

interface PeriodStats {
  revenue: number
  profit: number
  transactions: number
  avgTransactionValue: number
}

export default function LaporanPage() {
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<PeriodStats>({
    revenue: 0,
    profit: 0,
    transactions: 0,
    avgTransactionValue: 0,
  })
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    loadReportData()
  }, [selectedPeriod])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()

      switch (selectedPeriod) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'month':
          startDate.setDate(startDate.getDate() - 30)
          break
      }

      // Fetch transactions
      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select('id, total_amount, total_hpp, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      setTransactions(transactionsData || [])

      // Calculate stats
      const revenue = transactionsData?.reduce((sum, t) => sum + t.total_amount, 0) || 0
      const hpp = transactionsData?.reduce((sum, t) => sum + t.total_hpp, 0) || 0
      const profit = revenue - hpp
      const count = transactionsData?.length || 0

      setStats({
        revenue,
        profit,
        transactions: count,
        avgTransactionValue: count > 0 ? revenue / count : 0,
      })

      // Process chart data
      const dailyData: { [key: string]: { revenue: number, profit: number, count: number } } = {}

      transactionsData?.forEach(t => {
        const date = new Date(t.created_at).toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'short' 
        })
        
        if (!dailyData[date]) {
          dailyData[date] = { revenue: 0, profit: 0, count: 0 }
        }
        
        dailyData[date].revenue += t.total_amount
        dailyData[date].profit += (t.total_amount - t.total_hpp)
        dailyData[date].count += 1
      })

      const categories = Object.keys(dailyData)
      const revenueData = Object.values(dailyData).map(d => d.revenue)
      const profitData = Object.values(dailyData).map(d => d.profit)
      const countData = Object.values(dailyData).map(d => d.count)

      setChartData({
        revenue: {
          options: {
            chart: {
              type: 'area',
              toolbar: { show: false },
              zoom: { enabled: false },
            },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3 },
            xaxis: { categories },
            colors: ['#22C55E', '#3B82F6'],
            fill: {
              type: 'gradient',
              gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.5,
                opacityTo: 0.1,
              },
            },
            legend: { position: 'top' },
            tooltip: {
              y: { formatter: (val: number) => formatCurrency(val) },
            },
          },
          series: [
            { name: 'Pendapatan', data: revenueData },
            { name: 'Profit', data: profitData },
          ],
        },
        transactions: {
          options: {
            chart: {
              type: 'bar',
              toolbar: { show: false },
            },
            plotOptions: {
              bar: {
                borderRadius: 8,
                columnWidth: '60%',
              },
            },
            dataLabels: { enabled: false },
            xaxis: { categories },
            colors: ['#3B82F6'],
            tooltip: {
              y: { formatter: (val: number) => `${val} transaksi` },
            },
          },
          series: [
            { name: 'Jumlah Transaksi', data: countData },
          ],
        },
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading report:', error)
      toast.error('Gagal memuat laporan')
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('Tidak ada data untuk diekspor')
      return
    }

    const headers = ['ID', 'Tanggal', 'Total', 'HPP', 'Profit']
    const rows = transactions.map(t => [
      t.id,
      new Date(t.created_at).toLocaleString('id-ID'),
      t.total_amount,
      t.total_hpp,
      t.total_amount - t.total_hpp,
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-${selectedPeriod}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Laporan berhasil diekspor')
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
      {/* Period Selection & Export */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'today' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('today')}
              >
                Hari Ini
              </Button>
              <Button
                variant={selectedPeriod === 'week' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                7 Hari
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                30 Hari
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={18} />}
              onClick={handleExportCSV}
            >
              Ekspor CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-neo flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Total Pendapatan
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency(stats.revenue)}
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
              Total Profit
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency(stats.profit)}
            </h3>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-neo flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Total Transaksi
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.transactions}
            </h3>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-neo flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Rata-rata per Transaksi
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency(stats.avgTransactionValue)}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Grafik Pendapatan & Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                options={chartData.revenue.options}
                series={chartData.revenue.series}
                type="area"
                height={350}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grafik Jumlah Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                options={chartData.transactions.options}
                series={chartData.transactions.series}
                type="bar"
                height={300}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Tanggal & Waktu
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Total
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    HPP
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((transaction) => {
                  const profit = transaction.total_amount - transaction.total_hpp
                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-neutral-900 dark:text-white">
                        #{transaction.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                        {formatDate(transaction.created_at, 'dd MMM yyyy, HH:mm')}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-neutral-900 dark:text-white">
                        {formatCurrency(transaction.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-neutral-700 dark:text-neutral-300">
                        {formatCurrency(transaction.total_hpp)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(profit)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  Belum ada transaksi pada periode ini
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}