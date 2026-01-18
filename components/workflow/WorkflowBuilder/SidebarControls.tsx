'use client'

import { Plus, Bot, Database, Settings } from 'lucide-react'
import { DebugMenu } from './DebugMenu'
import { memo } from 'react'
import type { WorkflowV2 } from '@/types'

interface SidebarControlsProps {
    showChat: boolean
    setShowChat: (show: boolean) => void
    onLoadWorkflow: (data: Partial<WorkflowV2>) => void
}

export const SidebarControls = memo(({
    showChat,
    setShowChat,
    onLoadWorkflow
}: SidebarControlsProps) => {
    return (
        <div className="w-12 border-r border-border bg-card flex flex-col items-center py-3 gap-2 z-10">
            {/* New Workflow Button */}
            <button
                onClick={() => window.location.href = '/workflows/new'}
                title="New Workflow"
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
                <Plus className="h-4 w-4" />
            </button>

            <div className="w-6 h-px bg-border my-1" />

            {/* AI Chat */}
            <button
                onClick={() => setShowChat(!showChat)}
                title="AI Assistant"
                className={`p-2 rounded-lg transition-colors ${showChat
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
            >
                <Bot className="h-4 w-4" />
            </button>

            {/* Database */}
            <button
                title="Data"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
                <Database className="h-4 w-4" />
            </button>

            {/* Debug Menu */}
            <DebugMenu onLoadWorkflow={onLoadWorkflow} />

            {/* Bottom Settings */}
            <div className="mt-auto">
                <button
                    title="Settings"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    <Settings className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
})

SidebarControls.displayName = 'SidebarControls'
