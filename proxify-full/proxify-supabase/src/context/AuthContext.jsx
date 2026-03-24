import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const ensureUserRow = async (currentUser) => {
    if (!currentUser) return
    // Check if row exists first — only insert if missing, NEVER overwrite
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', currentUser.id)
      .maybeSingle()

    if (!existing) {
      await supabase.from('users').insert({
        id: currentUser.id,
        name: currentUser.user_metadata?.full_name || currentUser.email,
        email: currentUser.email,
        photo: currentUser.user_metadata?.avatar_url || null,
        area: '', city: '', phone: '',
        skills_offered: [], skills_needed: [],
        rating: 0, review_count: 0,
      })
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000)

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) await ensureUserRow(u)
        setLoading(false)
        clearTimeout(timeout)
      })
      .catch(() => { setLoading(false); clearTimeout(timeout) })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) await ensureUserRow(u)
    })

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  const loginWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

  const logout = async () => {
    try { await supabase.auth.signOut() } catch (e) { console.error('Sign out error:', e) }
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