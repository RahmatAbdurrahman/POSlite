import React from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const variants = {
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-300',
      messageColor: 'text-green-700 dark:text-green-400',
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-300',
      messageColor: 'text-red-700 dark:text-red-400',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      titleColor: 'text-yellow-800 dark:text-yellow-300',
      messageColor: 'text-yellow-700 dark:text-yellow-400',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-800 dark:text-blue-300',
      messageColor: 'text-blue-700 dark:text-blue-400',
    },
  }

  const variant = variants[type]
  const Icon = variant.icon

  return (
    <div
      className={`
        ${variant.container}
        rounded-lg border p-4 animate-slide-down
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={`w-5 h-5 ${variant.iconColor} flex-shrink-0 mt-0.5`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold ${variant.titleColor} mb-1`}>
              {title}
            </h4>
          )}
          {message && (
            <p className={`text-sm ${variant.messageColor}`}>
              {message}
            </p>
          )}
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className={`
              ${variant.iconColor}
              p-1 rounded hover:bg-black/5 dark:hover:bg-white/5
              transition-colors flex-shrink-0
            `.trim().replace(/\s+/g, ' ')}
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert