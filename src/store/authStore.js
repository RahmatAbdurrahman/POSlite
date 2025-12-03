import { create } from 'zustand'
import { supabase } from '../config/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  // Initialize auth state
  initAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({ user: session.user, profile, loading: false })
      } else {
        set({ user: null, profile: null, loading: false })
      }
    } catch (error) {
      console.error('Auth init error:', error)
      set({ loading: false })
    }
  },

  // Sign up
  signUp: async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // Create profile
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
        })
      }

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Sign in
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      set({ user: data.user, profile })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Sign out
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  // Update profile
  updateProfile: async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', useAuthStore.getState().user.id)
        .select()
        .single()

      if (error) throw error

      set({ profile: data })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },
}))

// Setup auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    useAuthStore.getState().initAuth()
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, profile: null })
  }
})