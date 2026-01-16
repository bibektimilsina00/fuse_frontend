import { Skeleton } from '@/components/ui/skeleton'

/**
 * Root loading state for the entire application.
 */
export default function Loading() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header skeleton */}
            <div className="border-b">
                <div className="flex h-16 items-center px-4 gap-4">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex-1" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>

            {/* Main content skeleton */}
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-32 rounded-lg" />
                        <Skeleton className="h-32 rounded-lg" />
                        <Skeleton className="h-32 rounded-lg" />
                    </div>
                    <Skeleton className="h-64 rounded-lg" />
                </div>
            </div>
        </div>
    )
}
