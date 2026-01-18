'use client'

import { Save, Code, Zap, Menu, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WorkflowMeta } from '@/types'
import { SaveStatus } from './hooks/useSaveState'
import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface CanvasHeaderProps {
    workflowMeta: WorkflowMeta | null
    updateWorkflowMeta: (updates: Partial<WorkflowMeta>) => void
    activeTab: string
    setActiveTab: (tab: string) => void
    showLogs: boolean
    setShowLogs: (show: boolean) => void
    isActive: boolean
    toggleActive: () => void
    onSave: () => void
    isSaving: boolean
    saveStatus: SaveStatus
    isDirty: boolean
    showNavSidebar: boolean
    setShowNavSidebar: (show: boolean) => void
}

export const CanvasHeader = memo(({
    workflowMeta,
    updateWorkflowMeta,
    activeTab,
    setActiveTab,
    showLogs,
    setShowLogs,
    isActive,
    toggleActive,
    onSave,
    isSaving,
    saveStatus,
    isDirty,
    showNavSidebar,
    setShowNavSidebar
}: CanvasHeaderProps) => {

    const renderSaveStatus = () => {
        if (isSaving) {
            return (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <div className="h-2 w-2 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
                    Saving...
                </span>
            )
        }

        if (saveStatus === 'saved' && !isDirty) {
            return <span className="text-xs text-muted-foreground">Saved</span>
        }

        if (isDirty) {
            return <span className="text-xs text-muted-foreground">Unsaved changes</span>
        }

        return null
    }

    return (
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-3 z-10 shrink-0">
            {/* Left - Logo and Workflow Name */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Image
                        src="/logo.png"
                        alt="Fuse"
                        width={28}
                        height={28}
                        className="object-contain"
                    />
                </Link>

                <div className="w-px h-5 bg-border" />

                <div className="flex items-center gap-2">
                    <input
                        value={workflowMeta?.name || ''}
                        onChange={(e) => updateWorkflowMeta({ name: e.target.value })}
                        placeholder="Untitled Workflow"
                        className="text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-0 w-48"
                    />
                    {renderSaveStatus()}
                </div>
            </div>

            {/* Center - Tab Navigation */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                <button
                    onClick={() => setActiveTab('editor')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${activeTab === 'editor'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Editor
                </button>
                <button
                    onClick={() => setActiveTab('executions')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${activeTab === 'executions'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Executions
                </button>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLogs(!showLogs)}
                    className={`h-8 text-xs ${showLogs ? 'bg-accent' : ''}`}
                >
                    <Code className="h-3.5 w-3.5 mr-1.5" />
                    Logs
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleActive}
                    className={`h-8 text-xs ${isActive ? 'border-primary text-primary' : ''}`}
                >
                    <Zap className={`h-3.5 w-3.5 mr-1.5 ${isActive ? 'fill-current' : ''}`} />
                    {isActive ? 'Active' : 'Activate'}
                </Button>

                <Button
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving}
                    className="h-8 text-xs"
                >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save
                </Button>
            </div>
        </header>
    )
})

CanvasHeader.displayName = 'CanvasHeader'
