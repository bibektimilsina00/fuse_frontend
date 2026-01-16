'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

/**
 * Error boundary for individual workflow pages.
 */
export default function WorkflowDetailError({ error, reset }: ErrorProps) {
    useEffect(() => {
        logger.error('Workflow detail error:', {
            message: error.message,
            digest: error.digest
        })
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] p-8 text-center">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-4 mb-4">
                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>

            <h2 className="text-2xl font-semibold mb-2">Failed to Load Workflow</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                We couldn&apos;t load this workflow. It may have been deleted or you may not have permission to view it.
            </p>

            {process.env.NODE_ENV === 'development' && (
                <pre className="text-left text-sm bg-muted p-4 rounded-lg mb-4 max-w-lg overflow-auto">
                    {error.message}
                </pre>
            )}

            <div className="flex gap-4">
                <Button onClick={reset} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
                <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    )
}
