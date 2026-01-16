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
    const { data: user, isLoading } = useCurrentUser()
    const logoutMutation = useLogout()

    const value: AuthContextType = {
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
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
