// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      // Create profile row if first sign-in
      if (currentUser) {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('id', currentUser.id)
          .single()

        if (!existing) {
          await supabase.from('users').insert({
            id: currentUser.id,
            name: currentUser.user_metadata?.full_name || currentUser.email,
            email: currentUser.email,
            photo: currentUser.user_metadata?.avatar_url || null,
            area: '',
            city: '',
            phone: '',
            skills_offered: [],
            skills_needed: [],
            rating: 0,
            review_count: 0,
          })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loginWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

  const logout = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
