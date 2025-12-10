import React, { useState, useEffect } from 'react'
import { Calendar, Download, TrendingUp, DollarSign, ShoppingBag, Percent } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate, formatDateTime } from '../utils/formatDate'

const Laporan = () => {
  const { transactions, loading, stats, getTransactionsByDateRange } = useTransactions()
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  // Fetch data saat date range berubah
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      getTransactionsByDateRange(dateRange.start, dateRange.end)
    }
  }, [dateRange])

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    })
  }

  const handleExport = () => {
    // Simple CSV export
    let csv = 'Tanggal,Total,HPP,Laba,Jumlah Item\n'
    
    transactions.forEach((trans) => {
      const itemCount = trans.transaction_items?.length || 0
      csv += `${formatDateTime(trans.created_at)},${trans.total_amount},${trans.total_hpp},${trans.total_amount - trans.total_hpp},${itemCount}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-${dateRange.start}-${dateRange.end}.csv`
    a.click()
  }

  // Hitung margin rata-rata
  const averageMargin = stats.totalAmount > 0 
    ? ((stats.totalProfit / stats.totalAmount) * 100).toFixed(1)
    : 0

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat laporan..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
            Laporan Penjualan
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Analisis performa penjualan toko Anda
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Download className="w-5 h-5" />}
          onClick={handleExport}
          disabled={transactions.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {/* Date Range Picker */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-light-accent dark:text-dark-accent" />
          <h2 className="text-lg font-semibold">Pilih Rentang Tanggal</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Tanggal Mulai</label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Tanggal Akhir</label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Menampilkan data dari <strong>{formatDate(dateRange.start)}</strong> sampai <strong>{formatDate(dateRange.end)}</strong>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {/* Total Pendapatan */}
        <Card className="hover-lift">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Total Pendapatan
              </p>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                {formatCurrency(stats.totalAmount)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Total HPP */}
        <Card className="hover-lift">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Total HPP
              </p>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                {formatCurrency(stats.totalHpp)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <ShoppingBag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        {/* Laba Kotor */}
        <Card className="hover-lift">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Laba Kotor
              </p>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.totalProfit)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Margin Rata-rata */}
        <Card className="hover-lift">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Margin Rata-rata
              </p>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                {averageMargin}%
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Percent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Summary Card */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Ringkasan Periode</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Jumlah Transaksi
            </p>
            <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">
              {stats.totalTransactions}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Rata-rata per Transaksi
            </p>
            <p className="text-xl font-semibold">
              {formatCurrency(stats.totalTransactions > 0 ? stats.totalAmount / stats.totalTransactions : 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Laba per Transaksi
            </p>
            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(stats.totalTransactions > 0 ? stats.totalProfit / stats.totalTransactions : 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Margin Keuntungan
            </p>
            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              {averageMargin}%
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Daftar Transaksi</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {transactions.length} transaksi ditemukan
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-head">
              <tr>
                <th className="table-th">ID</th>
                <th className="table-th">Tanggal & Waktu</th>
                <th className="table-th">Total</th>
                <th className="table-th">HPP</th>
                <th className="table-th">Laba</th>
                <th className="table-th">Margin</th>
                <th className="table-th">Item</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      Tidak ada transaksi dalam periode ini
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((trans) => {
                  const profit = parseFloat(trans.total_amount) - parseFloat(trans.total_hpp)
                  const margin = ((profit / parseFloat(trans.total_amount)) * 100).toFixed(1)
                  const itemCount = trans.transaction_items?.length || 0

                  return (
                    <tr key={trans.id} className="table-row-hover">
                      <td className="table-td font-mono text-sm">
                        #{trans.id}
                      </td>
                      <td className="table-td">
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(trans.created_at, 'dd MMM yyyy')}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {formatDate(trans.created_at, 'HH:mm:ss')}
                          </div>
                        </div>
                      </td>
                      <td className="table-td font-semibold text-light-accent dark:text-dark-accent">
                        {formatCurrency(trans.total_amount)}
                      </td>
                      <td className="table-td">
                        {formatCurrency(trans.total_hpp)}
                      </td>
                      <td className="table-td font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(profit)}
                      </td>
                      <td className="table-td">
                        <span className="badge badge-success">
                          {margin}%
                        </span>
                      </td>
                      <td className="table-td">
                        <span className="badge badge-info">
                          {itemCount} item
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details (Optional - bisa expand per row) */}
      {transactions.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Detail Transaksi Terakhir</h3>
          <div className="space-y-2">
            {transactions[0]?.transaction_items?.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div>
                  <p className="font-medium">{item.products?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.quantity} x {formatCurrency(item.harga_jual_saat_itu)}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatCurrency(item.quantity * item.harga_jual_saat_itu)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Laporan