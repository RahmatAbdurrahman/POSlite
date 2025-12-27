import Link from 'next/link'
import { 
  Store, 
  TrendingUp, 
  Package, 
  BarChart3, 
  Zap,
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Zap,
      title: 'Kasir Super Cepat',
      description: 'Proses transaksi dalam hitungan detik dengan antarmuka yang intuitif'
    },
    {
      icon: Package,
      title: 'Manajemen Inventaris',
      description: 'Kelola stok produk dengan mudah, termasuk alert stok menipis'
    },
    {
      icon: BarChart3,
      title: 'Laporan Real-time',
      description: 'Pantau pendapatan dan profit secara real-time dengan grafik interaktif'
    },
    {
      icon: TrendingUp,
      title: 'HPP Otomatis',
      description: 'Perhitungan Harga Pokok Penjualan dengan metode weighted average'
    },
    {
      icon: Smartphone,
      title: 'Responsive Design',
      description: 'Akses dari desktop, tablet, atau smartphone dengan tampilan optimal'
    },
    {
      icon: Shield,
      title: 'Aman & Terpercaya',
      description: 'Data Anda tersimpan aman dengan enkripsi tingkat enterprise'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-neutral-800 rounded-neo shadow-neo-lg">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                POSLite
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6">
              Sistem POS Modern
              <br />
              <span className="text-primary-500">untuk UMKM Indonesia</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto mb-8">
              Kelola warung Anda dengan lebih mudah, cepat, dan profesional. 
              Dari kasir hingga laporan keuangan, semua dalam satu aplikasi.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 text-white font-semibold rounded-neo shadow-neo-lg hover:bg-primary-600 hover:shadow-neo-xl transition-all duration-200"
              >
                Mulai Gratis
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold rounded-neo shadow-neo-md hover:shadow-neo-lg transition-all duration-200 border-2 border-neutral-200 dark:border-neutral-700"
              >
                Masuk
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-slide-up">
            <div className="bg-white dark:bg-neutral-800 rounded-neo shadow-neo-md p-6 text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">100%</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Gratis Selamanya</div>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-neo shadow-neo-md p-6 text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">⚡</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Super Cepat</div>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-neo shadow-neo-md p-6 text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">🇮🇩</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Made in Indonesia</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-neutral-800 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Fitur Lengkap untuk Bisnis Anda
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Semua yang Anda butuhkan untuk mengelola warung dengan lebih efisien
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="bg-neutral-50 dark:bg-neutral-900 rounded-neo p-6 hover:shadow-neo-lg transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-neo flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-neo shadow-neo-xl p-8 lg:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-8 text-center">
                Mengapa Memilih POSLite?
              </h2>
              
              <div className="space-y-4">
                {[
                  'Tidak perlu instalasi ribet, langsung pakai dari browser',
                  'Gratis selamanya, tanpa biaya tersembunyi',
                  'Data tersimpan aman di cloud, tidak akan hilang',
                  'Perhitungan HPP otomatis dengan metode weighted average',
                  'Laporan lengkap untuk membantu analisis bisnis',
                  'Dukungan mode gelap untuk kenyamanan mata',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                    <p className="text-neutral-700 dark:text-neutral-300">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700 text-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 text-white font-semibold rounded-neo shadow-neo-lg hover:bg-primary-600 hover:shadow-neo-xl transition-all duration-200"
                >
                  Daftar Sekarang - Gratis!
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                POSLite
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Sistem POS Modern untuk UMKM Indonesia
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              © 2025 POSLite. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}