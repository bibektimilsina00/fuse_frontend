'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/services/queries/auth'

export default function HomePage() {
    const router = useRouter()
    const { data: user, isLoading } = useCurrentUser()

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                router.push('/dashboard')
            } else {
                router.push('/auth/login')
            }
        }
    }, [user, isLoading, router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
    )
}
