import { useAuthStore } from '../store/authStore'

/**
 * Custom hook untuk mengakses auth state dan functions
 * Wrapper untuk authStore agar lebih mudah digunakan
 */
export const useAuth = () => {
  const {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  } = useAuthStore()

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}

export default useAuth