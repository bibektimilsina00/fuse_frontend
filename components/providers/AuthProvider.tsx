'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useCurrentUser, useLogout } from '@/services/queries/auth'
import type { User } from '@/services/api/auth'

interface AuthContextType {
    user: User | null | undefined
    isLoading: boolean
    isAuthenticated: boolean
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: user, isLoading, error } = useCurrentUser()
    const logoutMutation = useLogout()

    // If we get a 401 error, treat as not authenticated (don't keep retrying)
    const effectiveUser = error ? null : (user ?? null)
    const effectiveLoading = error ? false : isLoading

    const value: AuthContextType = {
        user: effectiveUser,
        isLoading: effectiveLoading,
        isAuthenticated: !!effectiveUser,
        logout: () => logoutMutation.mutate(),
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
