'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

/**
 * Next.js App Router error boundary for the entire application.
 * Catches errors in server and client components.
 */
export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error to our logging service
        logger.error('Application error:', {
            message: error.message,
            digest: error.digest,
            stack: error.stack
        })
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6 mb-6">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
                An unexpected error occurred. Our team has been notified and is working on a fix.
            </p>

            {process.env.NODE_ENV === 'development' && (
                <div className="w-full max-w-2xl mb-6">
                    <details className="text-left">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                            Error details (development only)
                        </summary>
                        <pre className="mt-2 text-xs bg-muted p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                            {error.message}
                            {error.stack && `\n\nStack trace:\n${error.stack}`}
                            {error.digest && `\n\nDigest: ${error.digest}`}
                        </pre>
                    </details>
                </div>
            )}

            <div className="flex gap-4">
                <Button onClick={reset} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try again
                </Button>
                <Button asChild variant="outline">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Go home
                    </Link>
                </Button>
            </div>
        </div>
    )
}
