/**
 * Format number menjadi format currency Rupiah
 * @param {number} amount - Jumlah yang akan diformat
 * @param {boolean} showPrefix - Tampilkan "Rp" atau tidak (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showPrefix = true) => {
  if (amount === null || amount === undefined) return showPrefix ? 'Rp 0' : '0'

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  // Jika tidak mau prefix "Rp", hapus
  if (!showPrefix) {
    return formatted.replace('Rp', '').trim()
  }

  return formatted
}

/**
 * Format number dengan thousand separator tanpa currency
 * @param {number} amount - Jumlah yang akan diformat
 * @returns {string} Formatted number string
 */
export const formatNumber = (amount) => {
  if (amount === null || amount === undefined) return '0'
  
  return new Intl.NumberFormat('id-ID').format(amount)
}

/**
 * Parse currency string kembali ke number
 * @param {string} currencyString - String currency (contoh: "Rp 50.000")
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0
  
  // Hapus "Rp", titik, dan spasi
  const cleaned = currencyString
    .replace(/Rp/g, '')
    .replace(/\./g, '')
    .replace(/\s/g, '')
    .trim()
  
  return parseFloat(cleaned) || 0
}

/**
 * Format currency dengan warna (untuk profit/loss)
 * @param {number} amount - Jumlah yang akan diformat
 * @param {boolean} colored - Tambahkan class warna atau tidak
 * @returns {object} { text, className }
 */
export const formatCurrencyColored = (amount, colored = true) => {
  const text = formatCurrency(amount)
  
  if (!colored) {
    return { text, className: '' }
  }

  if (amount > 0) {
    return {
      text: `+${text}`,
      className: 'text-green-600 dark:text-green-400',
    }
  } else if (amount < 0) {
    return {
      text,
      className: 'text-red-600 dark:text-red-400',
    }
  } else {
    return {
      text,
      className: 'text-gray-600 dark:text-gray-400',
    }
  }
}

export default formatCurrency