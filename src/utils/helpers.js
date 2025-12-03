import { format, startOfDay, endOfDay, subDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

// Format currency ke Rupiah
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  return format(new Date(date), formatStr, { locale: idLocale })
}

// Format datetime
export const formatDateTime = (date) => {
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: idLocale })
}

// Get today range (untuk query)
export const getTodayRange = () => {
  const today = new Date()
  return {
    start: startOfDay(today).toISOString(),
    end: endOfDay(today).toISOString(),
  }
}

// Get date range (untuk query laporan)
export const getDateRange = (startDate, endDate) => {
  return {
    start: startOfDay(new Date(startDate)).toISOString(),
    end: endOfDay(new Date(endDate)).toISOString(),
  }
}

// Get last 7 days
export const getLast7Days = () => {
  const today = new Date()
  const days = []
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i)
    days.push({
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'dd MMM', { locale: idLocale }),
    })
  }
  
  return days
}

// Animation variants for framer-motion (optional)
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Count up animation helper
export const animateValue = (start, end, duration, callback) => {
  let startTimestamp = null
  
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp
    const progress = Math.min((timestamp - startTimestamp) / duration, 1)
    const value = Math.floor(progress * (end - start) + start)
    callback(value)
    
    if (progress < 1) {
      window.requestAnimationFrame(step)
    }
  }
  
  window.requestAnimationFrame(step)
}

// Debounce function untuk search
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}