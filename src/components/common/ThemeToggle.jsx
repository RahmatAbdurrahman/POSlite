import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg
        bg-gray-200 dark:bg-gray-700
        hover:bg-gray-300 dark:hover:bg-gray-600
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      aria-label="Toggle theme"
    >
      {/* Sun Icon (Light Mode) */}
      <Sun
        className={`
          w-5 h-5 text-yellow-500
          transition-all duration-300
          ${isDarkMode ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}
          absolute inset-0 m-auto
        `.trim().replace(/\s+/g, ' ')}
      />

      {/* Moon Icon (Dark Mode) */}
      <Moon
        className={`
          w-5 h-5 text-blue-400
          transition-all duration-300
          ${isDarkMode ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}
          absolute inset-0 m-auto
        `.trim().replace(/\s+/g, ' ')}
      />

      {/* Placeholder untuk maintain size */}
      <div className="w-5 h-5 opacity-0" />
    </button>
  )
}

export default ThemeToggle