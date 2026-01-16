import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

/**
 * Loading state for individual workflow pages.
 */
export default function WorkflowDetailLoading() {
    return (
        <div className="flex flex-col h-screen">
            {/* Toolbar skeleton */}
            <div className="border-b bg-background/95 backdrop-blur">
                <div className="flex h-14 items-center px-4 gap-4">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-6 w-48" />
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>
            </div>

            {/* Main canvas area */}
            <div className="flex-1 relative bg-muted/30">
                {/* Center loading indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Loading workflow canvas...</p>
                    </div>
                </div>

                {/* Node panel skeleton */}
                <div className="absolute left-4 top-4 w-64 space-y-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <div className="space-y-1">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-lg" />
                        ))}
                    </div>
                </div>

                {/* Properties panel skeleton */}
                <div className="absolute right-4 top-4 w-80 space-y-3">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
            </div>
        </div>
    )
}
