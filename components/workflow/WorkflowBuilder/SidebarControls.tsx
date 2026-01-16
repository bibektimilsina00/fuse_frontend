'use client'

import { Plus, Bot, Database, Users, Settings } from 'lucide-react'
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
        <div className="w-14 border-r border-border bg-card/50 flex flex-col items-center py-4 gap-4 z-10">
            <button
                onClick={() => window.location.href = '/workflows/new'}
                title="New Workflow"
                className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
            >
                <Plus className="h-5 w-5" />
            </button>

            <div className="w-8 h-[1px] bg-border" />

            <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-lg transition-colors ${showChat ? 'bg-accent text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
            >
                <Bot className="h-5 w-5" />
            </button>

            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Database className="h-5 w-5" />
            </button>

            {/* Integrated Debug Menu */}
            <DebugMenu onLoadWorkflow={onLoadWorkflow} />

            <div className="mt-auto flex flex-col gap-4">
                <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Users className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Settings className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
})

SidebarControls.displayName = 'SidebarControls'
