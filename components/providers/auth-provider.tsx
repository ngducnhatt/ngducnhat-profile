'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import type { Session, User } from '@supabase/supabase-js'

import { getSupabaseClient } from '@/lib/supabase-client'

type Role = 'admin' | 'user'

type AuthContextValue = {
    user: User | null
    session: Session | null
    role: Role | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const ROLE_BY_EMAIL: Record<string, Role> = {
    'ngducnhat@admin.com': 'admin',
    'user@example.com': 'user',
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const supabase = useMemo(() => getSupabaseClient(), [])
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<Role | null>(null)
    const [loading, setLoading] = useState(true)

    const resolveRole = (authUser: User | null): Role | null => {
        if (!authUser?.email) return null
        return ROLE_BY_EMAIL[authUser.email] ?? 'user'
    }

    useEffect(() => {
        let mounted = true

        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return
            setSession(data.session)
            setUser(data.session?.user ?? null)
            setRole(resolveRole(data.session?.user ?? null))
            setLoading(false)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
            setUser(newSession?.user ?? null)
            setRole(resolveRole(newSession?.user ?? null))
            setLoading(false)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [supabase])

    const signOut = async () => {
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
        setRole(null)
    }

    const value = useMemo(
        () => ({
            user,
            session,
            role,
            loading,
            signOut,
        }),
        [user, session, role, loading],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
