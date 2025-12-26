'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Card'
import { User, Building2, Mail, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PengaturanPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState({
    full_name: '',
    business_name: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          business_name: profile.business_name || '',
        })
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Gagal memuat data pengguna')
      setLoading(false)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          business_name: profileData.business_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profil berhasil diperbarui')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Gagal memperbarui profil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password baru tidak cocok')
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast.success('Password berhasil diubah')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast.error(error.message || 'Gagal mengubah password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              leftIcon={<Mail size={18} />}
              disabled
              helperText="Email tidak dapat diubah"
            />

            <Input
              label="Nama Lengkap"
              name="full_name"
              type="text"
              placeholder="Nama Anda"
              value={profileData.full_name}
              onChange={handleProfileChange}
              leftIcon={<User size={18} />}
              required
            />

            <Input
              label="Nama Warung/Toko"
              name="business_name"
              type="text"
              placeholder="Nama Bisnis Anda"
              value={profileData.business_name}
              onChange={handleProfileChange}
              leftIcon={<Building2 size={18} />}
              helperText="Nama ini akan muncul di laporan dan struk"
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save size={18} />}
                loading={saving}
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Password Baru"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              leftIcon={<Lock size={18} />}
              helperText="Minimal 6 karakter"
              required
            />

            <Input
              label="Konfirmasi Password Baru"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              leftIcon={<Lock size={18} />}
              required
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Lock size={18} />}
                loading={saving}
              >
                Ubah Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                User ID
              </span>
              <span className="text-sm font-mono text-neutral-900 dark:text-white">
                {user?.id}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Tanggal Daftar
              </span>
              <span className="text-sm text-neutral-900 dark:text-white">
                {user?.created_at && new Date(user.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Status Email
              </span>
              <span className="text-sm">
                {user?.email_confirmed_at ? (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                    Terverifikasi
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-semibold">
                    Belum Terverifikasi
                  </span>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>Tentang Aplikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Aplikasi
              </span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">
                POSLite v1.0.0
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Framework
              </span>
              <span className="text-sm text-neutral-900 dark:text-white">
                Next.js 15 + Supabase
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Dibuat untuk
              </span>
              <span className="text-sm text-neutral-900 dark:text-white">
                UMKM Indonesia 🇮🇩
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}