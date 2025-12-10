import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, ArrowRight, Sparkles } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Alert from '../../components/common/alert'
import { useAuthStore } from '../../store/authStore'

const SetupToko = () => {
  const navigate = useNavigate()
  const { updateProfile, profile } = useAuthStore()
  
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!businessName.trim()) {
      setError('Nama toko tidak boleh kosong')
      setLoading(false)
      return
    }

    const { success, error: updateError } = await updateProfile({
      business_name: businessName,
    })

    if (success) {
      navigate('/dashboard')
    } else {
      setError(updateError || 'Gagal menyimpan data. Silakan coba lagi.')
    }
    
    setLoading(false)
  }

  const handleSkip = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Setup Card */}
      <div className="w-full max-w-md animate-scale-up">
        <div className="card p-8">
          {/* Icon & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-light-accent to-green-600 dark:from-dark-accent dark:to-green-400 animate-pulse">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2 flex items-center justify-center gap-2">
              Setup Toko Anda
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Langkah terakhir! Beri nama toko Anda agar lebih personal
            </p>
          </div>

          {/* Welcome Message */}
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-300">
              <span className="font-semibold">Hai {profile?.full_name || 'User'}! 👋</span>
              <br />
              Selamat bergabung dengan POSLite. Mari kita mulai dengan memberikan identitas toko Anda.
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

          {/* Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nama Toko / Warung"
              type="text"
              name="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Contoh: Warung Ibu Siti"
              icon={<Store className="w-5 h-5" />}
              required
            />

            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                Simpan & Mulai
              </Button>

              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleSkip}
                disabled={loading}
              >
                Lewati Dulu
              </Button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            💡 Tip: Nama toko bisa diubah kapan saja di halaman Pengaturan
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="card p-3">
            <div className="text-2xl mb-1">📊</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Dashboard Real-time
            </p>
          </div>
          <div className="card p-3">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Kasir Cepat
            </p>
          </div>
          <div className="card p-3">
            <div className="text-2xl mb-1">📦</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Kelola Stok
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupToko