import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import LoadingSpinner from './components/common/LoadingSpinner'
import Layout from './components/layout/Layout'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import SetupToko from './pages/auth/SetupToko'

// Main Pages (placeholder untuk sekarang)
import Dashboard from './pages/Dashboard'
import Kasir from './pages/Kasir'
import Inventory from './pages/Inventory'
import Laporan from './pages/Laporan'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route Component (redirect jika sudah login)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthStore()

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat..." />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { initAuth } = useAuthStore()
  const { initTheme } = useThemeStore()

  // Initialize auth and theme on mount
  useEffect(() => {
    initAuth()
    initTheme()
  }, [initAuth, initTheme])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Setup Route (semi-protected) */}
        <Route
          path="/setup-toko"
          element={
            <ProtectedRoute>
              <SetupToko />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kasir"
          element={
            <ProtectedRoute>
              <Layout>
                <Kasir />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <ProtectedRoute>
              <Layout>
                <Laporan />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App