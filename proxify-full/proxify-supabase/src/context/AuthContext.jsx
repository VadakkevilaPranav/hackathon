import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
        clearTimeout(timeout)
      })
      .catch(() => {
        setLoading(false)
        clearTimeout(timeout)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        try {
          await supabase.from('users').upsert({
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
          }, { onConflict: 'id', ignoreDuplicates: false })
        } catch (e) {
          console.log('profile upsert error:', e)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const loginWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

  const logout = () => {
    localStorage.clear()
    sessionStorage.clear()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)