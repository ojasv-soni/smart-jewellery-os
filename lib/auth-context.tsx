'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import getPublicSupabase from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = getPublicSupabase()
    let mounted = true

    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) {
        return
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    }

    initializeAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) {
        return
      }
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
