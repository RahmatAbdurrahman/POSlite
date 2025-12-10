import { useThemeStore } from '../store/themeStore'

export const useTheme = () => {
  const { isDarkMode, toggleTheme } = useThemeStore()

  return {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light',
  }
}

export default useTheme