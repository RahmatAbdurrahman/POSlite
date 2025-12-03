import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => {
        const newMode = !state.isDarkMode
        // Update HTML class untuk Tailwind dark mode
        if (newMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        return { isDarkMode: newMode }
      }),
      initTheme: () => set((state) => {
        // Apply theme saat aplikasi pertama kali dimuat
        if (state.isDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        return state
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
)