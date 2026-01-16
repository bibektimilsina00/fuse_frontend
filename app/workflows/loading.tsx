import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

/**
 * Loading state for the workflow builder.
 */
export default function WorkflowLoading() {
    return (
        <div className="flex flex-col h-screen">
            {/* Toolbar skeleton */}
            <div className="border-b bg-background/95 backdrop-blur">
                <div className="flex h-14 items-center px-4 gap-4">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-6 w-48" />
                    <div className="flex-1" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>

            {/* Main canvas area */}
            <div className="flex-1 relative bg-muted/30">
                {/* Center loading indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Loading workflow...</p>
                    </div>
                </div>

                {/* Sidebar skeleton */}
                <div className="absolute left-4 top-4 w-64 space-y-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            </div>
        </div>
    )
}
