import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

// Utility untuk merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format mata uang Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format angka dengan pemisah ribuan
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

// Format tanggal
export function formatDate(
  date: string | Date,
  formatStr: string = 'dd MMM yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: idLocale })
}

// Format tanggal dengan waktu
export function formatDateTime(
  date: string | Date,
  formatStr: string = 'dd MMM yyyy, HH:mm'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: idLocale })
}

// Format waktu relatif (e.g., "2 jam yang lalu")
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { 
    addSuffix: true, 
    locale: idLocale 
  })
}

// Hitung persentase profit margin
export function calculateProfitMargin(
  hargaJual: number,
  hargaBeli: number
): number {
  if (hargaBeli === 0) return 0
  return ((hargaJual - hargaBeli) / hargaBeli) * 100
}

// Hitung profit
export function calculateProfit(
  hargaJual: number,
  hargaBeli: number,
  quantity: number = 1
): number {
  return (hargaJual - hargaBeli) * quantity
}

// Status stok berdasarkan level
export function getStockStatus(
  currentStock: number,
  alertLevel: number
): 'normal' | 'low' | 'out' {
  if (currentStock === 0) return 'out'
  if (currentStock <= alertLevel) return 'low'
  return 'normal'
}

// Warna badge berdasarkan status stok
export function getStockStatusColor(status: 'normal' | 'low' | 'out'): string {
  switch (status) {
    case 'out':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'low':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'normal':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
}

// Label status stok
export function getStockStatusLabel(status: 'normal' | 'low' | 'out'): string {
  switch (status) {
    case 'out':
      return 'Habis'
    case 'low':
      return 'Stok Menipis'
    case 'normal':
      return 'Stok Normal'
  }
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Validasi email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}