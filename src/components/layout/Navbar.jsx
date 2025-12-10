import React from 'react'
import { Menu, Bell, User, LogOut } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'
import { useAuthStore } from '../../store/authStore'

const Navbar = ({ onMenuClick }) => {
  const { profile, signOut } = useAuthStore()

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      await signOut()
    }
  }

  return (
    <nav className="card sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 rounded-none">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Menu Button (Mobile) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-light-accent to-green-600 dark:from-dark-accent dark:to-green-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-light-text dark:text-dark-text">
                POSLite
              </h1>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {profile?.business_name || 'Toko Anda'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {/* Badge (jika ada notif) */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="text-right">
              <p className="text-sm font-medium text-light-text dark:text-dark-text">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Pemilik
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar