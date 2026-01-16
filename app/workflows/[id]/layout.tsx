'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers'

export const dynamicParams = false

export default function WorkflowEditorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login')
        }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen" suppressHydrationWarning>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" suppressHydrationWarning></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    // Return children directly for fullscreen editor
    return <>{children}</>
}
