import React from 'react'

const LoadingSpinner = ({ size = 'md', text, fullScreen = false }) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  const spinnerElement = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Spinner */}
      <div
        className={`
          ${sizeClasses[size]}
          border-light-accent dark:border-dark-accent
          border-t-transparent
          rounded-full
          animate-spin
        `.trim().replace(/\s+/g, ' ')}
      />

      {/* Text */}
      {text && (
        <p
          className={`
            ${textSizeClasses[size]}
            text-gray-600 dark:text-gray-400
            font-medium
          `.trim().replace(/\s+/g, ' ')}
        >
          {text}
        </p>
      )}
    </div>
  )

  // Full screen variant
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm">
        {spinnerElement}
      </div>
    )
  }

  // Inline variant
  return spinnerElement
}

export default LoadingSpinner