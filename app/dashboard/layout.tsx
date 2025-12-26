import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'POSLite - Sistem POS Modern untuk UMKM Indonesia',
  description: 'Aplikasi Point of Sale dan manajemen inventaris yang dirancang khusus untuk UMKM/Warung di Indonesia. Cepat, akurat, dan profesional.',
  keywords: ['POS', 'Point of Sale', 'UMKM', 'Warung', 'Inventaris', 'Manajemen Stok', 'Indonesia'],
  authors: [{ name: 'POSLite Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#22C55E',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}