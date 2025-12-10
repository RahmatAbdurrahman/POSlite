import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

/**
 * Format date dengan format default
 * @param {Date|string} date - Date object atau ISO string
 * @param {string} formatStr - Format string (default: 'dd MMM yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: idLocale })
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
  }
}

/**
 * Format date dengan waktu
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Formatted date dengan waktu
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd MMM yyyy, HH:mm')
}

/**
 * Format waktu saja
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Formatted time
 */
export const formatTime = (date) => {
  return formatDate(date, 'HH:mm')
}

/**
 * Format date untuk input type="date"
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Formatted date (yyyy-MM-dd)
 */
export const formatDateInput = (date) => {
  return formatDate(date, 'yyyy-MM-dd')
}

/**
 * Format date relatif (contoh: "2 jam yang lalu")
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Relative time
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    
    // Jika hari ini, tampilkan "Hari ini, HH:mm"
    if (isToday(dateObj)) {
      return `Hari ini, ${format(dateObj, 'HH:mm')}`
    }
    
    // Jika kemarin, tampilkan "Kemarin, HH:mm"
    if (isYesterday(dateObj)) {
      return `Kemarin, ${format(dateObj, 'HH:mm')}`
    }
    
    // Selain itu, tampilkan relative time
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: idLocale,
    })
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return '-'
  }
}

/**
 * Format date untuk struk/invoice
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Formatted date untuk struk
 */
export const formatInvoiceDate = (date) => {
  return formatDate(date, 'dd MMMM yyyy, HH:mm:ss')
}

/**
 * Get nama hari dalam bahasa Indonesia
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Nama hari
 */
export const getDayName = (date) => {
  return formatDate(date, 'EEEE')
}

/**
 * Get nama bulan dalam bahasa Indonesia
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Nama bulan
 */
export const getMonthName = (date) => {
  return formatDate(date, 'MMMM yyyy')
}

/**
 * Check apakah tanggal adalah hari ini
 * @param {Date|string} date - Date object atau ISO string
 * @returns {boolean}
 */
export const isDateToday = (date) => {
  if (!date) return false
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isToday(dateObj)
  } catch {
    return false
  }
}

export default formatDate