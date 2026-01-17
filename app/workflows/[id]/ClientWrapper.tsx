'use client'

import dynamic from 'next/dynamic'

// Dynamically import the workflow builder with SSR disabled
const WorkflowBuilderPage = dynamic(
    () => import('./WorkflowPage'),
    {
        ssr: false,
        loading: () => (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="text-muted-foreground">Loading workflow builder...</div>
            </div>
        )
    }
)

export default function ClientWrapper() {
    return <WorkflowBuilderPage />
}
