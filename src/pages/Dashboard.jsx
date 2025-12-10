import React, { useState, useEffect, useRef } from 'react'
import { TrendingUp, DollarSign, ShoppingCart, AlertTriangle, Package } from 'lucide-react'
import Chart from 'react-apexcharts'
import { useTransactions } from '../hooks/useTransactions'
import { useProducts } from '../hooks/useProducts'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCurrency } from '../utils/formatCurrency'
import { getLast7Days } from '../utils/helpers'
import { animateValue } from '../utils/animations'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const navigate = useNavigate()
  const {
    stats,
    getTodayTransactions,
    getTopProducts,
    subscribeToTransactions,
  } = useTransactions()

  const { getLowStockProducts } = useProducts()

  const [loading, setLoading] = useState(true)
  const [salesChartData, setSalesChartData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])

  // Refs untuk animasi count-up
  const pendapatanRef = useRef(null)
  const labaRef = useRef(null)
  const transaksiRef = useRef(null)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await getTodayTransactions()
      
      const topProductsResult = await getTopProducts(5)
      if (topProductsResult.success) {
        setTopProducts(topProductsResult.data)
      }

      const lowStock = getLowStockProducts()
      setLowStockProducts(lowStock)

      setLoading(false)
    }

    fetchData()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToTransactions(() => {
      fetchData()
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // Animate count-up saat stats berubah
  useEffect(() => {
    if (pendapatanRef.current) {
      animateValue(0, stats.totalAmount, 1000, (val) => {
        pendapatanRef.current.textContent = formatCurrency(val)
      })
    }
    if (labaRef.current) {
      animateValue(0, stats.totalProfit, 1000, (val) => {
        labaRef.current.textContent = formatCurrency(val)
      })
    }
    if (transaksiRef.current) {
      animateValue(0, stats.totalTransactions, 800, (val) => {
        transaksiRef.current.textContent = val
      })
    }
  }, [stats])

  // Generate chart data untuk 7 hari terakhir
  useEffect(() => {
    const days = getLast7Days()
    // Untuk demo, kita gunakan data dummy
    // Di production, fetch dari database berdasarkan tanggal
    const dummyData = days.map((day) => ({
      date: day.label,
      amount: Math.floor(Math.random() * 5000000) + 1000000,
    }))
    setSalesChartData(dummyData)
  }, [])

  // Chart options untuk Sales Chart
  const salesChartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
      },
    },
    xaxis: {
      categories: salesChartData.map((d) => d.date),
      labels: {
        style: {
          colors: '#6B7280',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatCurrency(val, false),
        style: {
          colors: '#6B7280',
        },
      },
    },
    colors: ['#22C55E'],
    tooltip: {
      y: {
        formatter: (val) => formatCurrency(val),
      },
    },
    grid: {
      borderColor: '#E5E7EB',
    },
  }

  const salesChartSeries = [
    {
      name: 'Penjualan',
      data: salesChartData.map((d) => d.amount),
    },
  ]

  // Chart options untuk Top Products
  const topProductsChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: topProducts.map((p) => p.name),
      labels: {
        style: {
          colors: '#6B7280',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280',
        },
      },
    },
    colors: ['#3B82F6'],
    tooltip: {
      y: {
        formatter: (val) => `${val} terjual`,
      },
    },
    grid: {
      borderColor: '#E5E7EB',
    },
  }

  const topProductsChartSeries = [
    {
      name: 'Jumlah Terjual',
      data: topProducts.map((p) => p.total_quantity),
    },
  ]

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat dashboard..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
          Dashboard
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
          Selamat datang kembali! Berikut ringkasan toko Anda hari ini.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        {/* Penjualan Hari Ini */}
        <Card className="hover-lift">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Penjualan Hari Ini
              </p>
              <h3
                ref={pendapatanRef}
                className="text-2xl font-bold text-light-text dark:text-dark-text"
              >
                {formatCurrency(stats.totalAmount)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Laba Kotor Hari Ini */}
        <Card className="hover-lift">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Laba Kotor Hari Ini
              </p>
              <h3
                ref={labaRef}
                className="text-2xl font-bold text-green-600 dark:text-green-400"
              >
                {formatCurrency(stats.totalProfit)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Transaksi Hari Ini */}
        <Card className="hover-lift">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Transaksi Hari Ini
              </p>
              <h3
                ref={transaksiRef}
                className="text-2xl font-bold text-light-text dark:text-dark-text"
              >
                {stats.totalTransactions}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card title="Tren Penjualan 7 Hari Terakhir">
          <Chart
            options={salesChartOptions}
            series={salesChartSeries}
            type="area"
            height={300}
          />
        </Card>

        {/* Top Products Chart */}
        <Card title="Top 5 Produk Terlaris">
          {topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              Belum ada data penjualan
            </div>
          ) : (
            <Chart
              options={topProductsChartOptions}
              series={topProductsChartSeries}
              type="bar"
              height={300}
            />
          )}
        </Card>
      </div>

      {/* Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card
          title="⚠️ Peringatan Stok Menipis"
          subtitle={`${lowStockProducts.length} produk memerlukan restock`}
        >
          <div className="space-y-2">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stok tersisa: <strong>{product.stock} unit</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/inventory')}
                  className="btn-sm btn-primary"
                >
                  Restock
                </button>
              </div>
            ))}
            
            {lowStockProducts.length > 5 && (
              <button
                onClick={() => navigate('/inventory')}
                className="text-sm text-light-accent dark:text-dark-accent hover:underline mt-2"
              >
                Lihat {lowStockProducts.length - 5} produk lainnya →
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card title="Aksi Cepat">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/kasir')}
            className="card-hover p-4 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="font-medium">Buka Kasir</p>
          </button>

          <button
            onClick={() => navigate('/inventory')}
            className="card-hover p-4 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-medium">Kelola Barang</p>
          </button>

          <button
            onClick={() => navigate('/laporan')}
            className="card-hover p-4 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="font-medium">Lihat Laporan</p>
          </button>

          <button
            onClick={() => navigate('/inventory')}
            className="card-hover p-4 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="font-medium">Cek Stok</p>
          </button>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard