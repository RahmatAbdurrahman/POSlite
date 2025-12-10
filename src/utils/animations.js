/**
 * Animasi count-up dari 0 ke nilai target
 * @param {number} start - Nilai awal
 * @param {number} end - Nilai akhir
 * @param {number} duration - Durasi animasi dalam ms
 * @param {function} callback - Function yang dipanggil setiap frame dengan nilai saat ini
 */
export const animateValue = (start, end, duration, callback) => {
  let startTimestamp = null
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp
    const progress = Math.min((timestamp - startTimestamp) / duration, 1)
    
    // Easing function (easeOutQuad)
    const easeProgress = progress * (2 - progress)
    const value = Math.floor(easeProgress * (end - start) + start)
    
    callback(value)
    
    if (progress < 1) {
      window.requestAnimationFrame(step)
    } else {
      callback(end) // Pastikan nilai akhir tepat
    }
  }
  
  window.requestAnimationFrame(step)
}

/**
 * Animasi count-up khusus untuk currency
 * @param {HTMLElement} element - Element DOM yang akan diupdate
 * @param {number} targetValue - Nilai target
 * @param {number} duration - Durasi animasi dalam ms (default: 1000)
 * @param {function} formatFunc - Function untuk format nilai (default: x => x)
 */
export const animateCurrency = (element, targetValue, duration = 1000, formatFunc = (x) => x) => {
  animateValue(0, targetValue, duration, (value) => {
    if (element) {
      element.textContent = formatFunc(value)
    }
  })
}

/**
 * Stagger animation - delay berbeda untuk setiap child element
 * @param {string} selector - CSS selector untuk parent element
 * @param {string} animationClass - Class animasi yang akan ditambahkan
 * @param {number} delayIncrement - Increment delay dalam ms (default: 100)
 */
export const staggerAnimation = (selector, animationClass, delayIncrement = 100) => {
  const elements = document.querySelectorAll(selector)
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add(animationClass)
    }, index * delayIncrement)
  })
}

/**
 * Slide in animation dengan intersection observer
 * @param {string} selector - CSS selector untuk elements yang akan diobserve
 * @param {object} options - Options untuk IntersectionObserver
 */
export const slideInOnScroll = (selector, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options,
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-slide-up')
        observer.unobserve(entry.target)
      }
    })
  }, defaultOptions)

  const elements = document.querySelectorAll(selector)
  elements.forEach((element) => {
    observer.observe(element)
  })

  return observer
}

/**
 * Pulse animation untuk highlight element
 * @param {HTMLElement} element - Element yang akan di-highlight
 * @param {number} duration - Durasi dalam ms (default: 1000)
 */
export const pulseHighlight = (element, duration = 1000) => {
  if (!element) return

  element.classList.add('animate-pulse')
  setTimeout(() => {
    element.classList.remove('animate-pulse')
  }, duration)
}

/**
 * Shake animation untuk error/warning
 * @param {HTMLElement} element - Element yang akan di-shake
 */
export const shakeElement = (element) => {
  if (!element) return

  const keyframes = [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(0)' },
  ]

  const options = {
    duration: 500,
    easing: 'ease-in-out',
  }

  element.animate(keyframes, options)
}

/**
 * Fade in element
 * @param {HTMLElement} element - Element yang akan di-fade in
 * @param {number} duration - Durasi dalam ms (default: 300)
 */
export const fadeIn = (element, duration = 300) => {
  if (!element) return

  element.style.opacity = '0'
  element.style.display = 'block'

  const keyframes = [
    { opacity: 0 },
    { opacity: 1 },
  ]

  const options = {
    duration,
    easing: 'ease-in',
    fill: 'forwards',
  }

  element.animate(keyframes, options)
}

/**
 * Fade out element
 * @param {HTMLElement} element - Element yang akan di-fade out
 * @param {number} duration - Durasi dalam ms (default: 300)
 * @param {function} callback - Function yang dipanggil setelah selesai
 */
export const fadeOut = (element, duration = 300, callback) => {
  if (!element) return

  const keyframes = [
    { opacity: 1 },
    { opacity: 0 },
  ]

  const options = {
    duration,
    easing: 'ease-out',
    fill: 'forwards',
  }

  const animation = element.animate(keyframes, options)
  
  animation.onfinish = () => {
    element.style.display = 'none'
    if (callback) callback()
  }
}

/**
 * Konfetti animation untuk celebration
 * @param {object} options - Options untuk konfetti
 */
export const celebrationConfetti = (options = {}) => {
  // Ini menggunakan canvas confetti library (opsional)
  // Untuk sekarang kita buat versi sederhana dengan emoji
  const emojis = ['🎉', '✨', '🎊', '💚', '🌟']
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `
  document.body.appendChild(container)

  for (let i = 0; i < 30; i++) {
    const emoji = document.createElement('div')
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)]
    emoji.style.cssText = `
      position: absolute;
      font-size: 2rem;
      left: ${Math.random() * 100}%;
      top: -50px;
      animation: fall ${2 + Math.random() * 2}s linear;
    `
    container.appendChild(emoji)
  }

  // Tambah CSS animation untuk fall
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fall {
      to {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)

  // Hapus setelah selesai
  setTimeout(() => {
    container.remove()
    style.remove()
  }, 4000)
}

export default {
  animateValue,
  animateCurrency,
  staggerAnimation,
  slideInOnScroll,
  pulseHighlight,
  shakeElement,
  fadeIn,
  fadeOut,
  celebrationConfetti,
}