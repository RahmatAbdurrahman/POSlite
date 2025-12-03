/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Mode Colors
        light: {
          bg: '#F9FAFB',
          container: '#FFFFFF',
          text: '#1F2937',
          'text-secondary': '#6B7280',
          accent: '#22C55E',
        },
        // Dark Mode Colors
        dark: {
          bg: '#111827',
          container: '#1F2937',
          text: '#F9FAFB',
          'text-secondary': '#9CA3AF',
          accent: '#4ADE80',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        countUp: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}