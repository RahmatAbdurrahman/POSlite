import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import ThemeToggle from '../../components/common/ThemeToggle'
import { useAuthStore } from '../../store/authStore'

const Login = () => {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { success, error: authError } = await signIn(
      formData.email,
      formData.password
    )

    if (success) {
      navigate('/dashboard')
    } else {
      setError(authError || 'Login gagal. Silakan coba lagi.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Theme Toggle (Top Right) */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md animate-scale-up">
        <div className="card p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-light-accent to-green-600 dark:from-dark-accent dark:to-green-400">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
              Selamat Datang! 👋
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Masuk ke POSLite untuk kelola toko Anda
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
              className="mb-6"
            />
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-light-accent focus:ring-light-accent"
                />
                <span className="text-gray-600 dark:text-gray-400">
                  Ingat saya
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-light-accent dark:text-dark-accent hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              Masuk
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Belum punya akun?{' '}
            </span>
            <Link
              to="/register"
              className="text-light-accent dark:text-dark-accent font-medium hover:underline"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500 dark:text-gray-400">
          POSLite © 2024 - Solusi Modern untuk UMKM Indonesia
        </div>
      </div>
    </div>
  )
}

export default Login