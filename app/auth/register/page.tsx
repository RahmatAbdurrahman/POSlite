'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Card'
import { Mail, Lock, User, Store, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    businessName: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error('Mohon lengkapi semua field yang wajib diisi')
      return false
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const supabase = createClient()
      
      // 1. Register user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            business_name: formData.businessName || null,
          }
        }
      })

      if (authError) throw authError

      // 2. Create profile (trigger akan handle ini di database)
      if (authData.user) {
        toast.success('Registrasi berhasil! Silakan cek email untuk verifikasi 📧')
        
        // Redirect ke login setelah 2 detik
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      
      if (error.message.includes('already registered')) {
        toast.error('Email sudah terdaftar. Silakan login.')
      } else {
        toast.error(error.message || 'Terjadi kesalahan saat registrasi')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-neo-lg mb-4 shadow-neo-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            POSLite
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Mulai kelola warung Anda dengan mudah
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-neutral-800 rounded-neo shadow-neo-xl p-8 animate-slide-up border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
            Buat Akun Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              name="fullName"
              placeholder="Budi Santoso"
              value={formData.fullName}
              onChange={handleChange}
              leftIcon={<User size={18} />}
              required
              disabled={loading}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail size={18} />}
              required
              disabled={loading}
            />

            <Input
              label="Nama Warung/Toko (Opsional)"
              type="text"
              name="businessName"
              placeholder="Warung Budi"
              value={formData.businessName}
              onChange={handleChange}
              leftIcon={<Building2 size={18} />}
              disabled={loading}
              helperText="Bisa diisi nanti di pengaturan"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock size={18} />}
              required
              disabled={loading}
              helperText="Minimal 6 karakter"
            />

            <Input
              label="Konfirmasi Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              leftIcon={<Lock size={18} />}
              required
              disabled={loading}
            />

            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="text-neutral-600 dark:text-neutral-400">
                Saya setuju dengan{' '}
                <Link href="/terms" className="text-primary-500 hover:text-primary-600 font-medium">
                  Syarat & Ketentuan
                </Link>{' '}
                dan{' '}
                <Link href="/privacy" className="text-primary-500 hover:text-primary-600 font-medium">
                  Kebijakan Privasi
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Daftar Sekarang
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300 dark:border-neutral-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-neutral-800 text-neutral-500">
                Atau
              </span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="text-primary-500 hover:text-primary-600 font-semibold"
            >
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          © 2025 POSLite.
        </p>
      </div>
    </div>
  )
}