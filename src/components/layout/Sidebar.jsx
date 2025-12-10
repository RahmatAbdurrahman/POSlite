import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText,
  X 
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Beranda',
      badge: null,
    },
    {
      path: '/kasir',
      icon: ShoppingCart,
      label: 'Kasir',
      badge: null,
    },
    {
      path: '/inventory',
      icon: Package,
      label: 'Barang',
      badge: null,
    },
    {
      path: '/laporan',
      icon: FileText,
      label: 'Laporan',
      badge: null,
    },
  ]

  return (
    <>
      {/* Backdrop (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-64 h-screen
          card rounded-none border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `.trim().replace(/\s+/g, ' ')}
      >
        <div className="flex flex-col h-full">
          {/* Close Button (Mobile) */}
          <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-light-accent dark:bg-dark-accent text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `.trim().replace(/\s+/g, ' ')}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="badge badge-danger">{item.badge}</span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Footer Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              POSLite v1.0
              <br />
              © 2024 - Neo Warung
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar