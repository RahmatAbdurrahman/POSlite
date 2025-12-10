import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Alert from '../../components/common/alert'
import ThemeToggle from '../../components/common/ThemeToggle'
import { useAuthStore } from '../../store/authStore'

const Register = () => {
  const navigate = useNavigate()
  const { signUp } = useAuthStore()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

    // Validasi
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      setLoading(false)
      return
    }

    const { success: signUpSuccess, error: authError } = await signUp(
      formData.email,
      formData.password,
      formData.fullName
    )

    if (signUpSuccess) {
      setSuccess(true)
      setTimeout(() => {
        navigate('/setup-toko')
      }, 2000)
    } else {
      setError(authError || 'Registrasi gagal. Silakan coba lagi.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md animate-scale-up">
        <div className="card p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-light-accent to-green-600 dark:from-dark-accent dark:to-green-400">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
              Daftar Akun Baru 🚀
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Mulai kelola toko Anda dengan POSLite
            </p>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert
              type="success"
              title="Berhasil!"
              message="Akun berhasil dibuat. Mengalihkan ke setup toko..."
              className="mb-6"
            />
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
              className="mb-6"
            />
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              icon={<User className="w-5 h-5" />}
              required
            />

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
              placeholder="Minimal 6 karakter"
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <Input
              label="Konfirmasi Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Ulangi password"
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <div className="text-xs text-gray-600 dark:text-gray-400">
              Dengan mendaftar, Anda menyetujui{' '}
              <Link to="/terms" className="text-light-accent dark:text-dark-accent hover:underline">
                Syarat & Ketentuan
              </Link>{' '}
              serta{' '}
              <Link to="/privacy" className="text-light-accent dark:text-dark-accent hover:underline">
                Kebijakan Privasi
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={success}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              Daftar Sekarang
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Sudah punya akun?{' '}
            </span>
            <Link
              to="/login"
              className="text-light-accent dark:text-dark-accent font-medium hover:underline"
            >
              Masuk
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

export default Register