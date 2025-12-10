import React from 'react'

const Card = ({
  children,
  title,
  subtitle,
  footer,
  hover = false,
  padding = 'normal',
  className = '',
  onClick,
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    normal: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={`
        ${hover ? 'card-hover' : 'card'}
        ${paddingClasses[padding]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      onClick={onClick}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card