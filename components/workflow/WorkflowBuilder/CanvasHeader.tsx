'use client'

import { Save, Code, Zap, Share2, Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WorkflowMeta } from '@/types'
import { SaveStatus } from './hooks/useSaveState'
import { memo } from 'react'

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

    const renderSaveButton = () => {
        if (isSaving) {
            return (
                <>
                    <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Saving...
                </>
            )
        }

        if (saveStatus === 'saved' && !isDirty) {
            return (
                <>
                    <Save className="h-3 w-3 mr-2" />
                    Saved
                </>
            )
        }

        if (saveStatus === 'error') {
            return (
                <>
                    <Save className="h-3 w-3 mr-2" />
                    Retry
                </>
            )
        }

        return (
            <>
                <Save className="h-3 w-3 mr-2" />
                {isDirty ? 'Save*' : 'Save'}
            </>
        )
    }

    return (
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 z-10 shrink-0">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setShowNavSidebar(!showNavSidebar)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    aria-label="Toggle navigation"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="flex flex-col">
                    <input
                        value={workflowMeta?.name || ''}
                        onChange={(e) => updateWorkflowMeta({ name: e.target.value })}
                        placeholder="Untitled Workflow"
                        className="font-semibold text-lg bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 w-64"
                    />
                    <input
                        value={workflowMeta?.description || ''}
                        onChange={(e) => updateWorkflowMeta({ description: e.target.value })}
                        placeholder="Add description..."
                        className="text-xs text-muted-foreground bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 w-96"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex bg-muted rounded-lg p-1 mr-4">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'editor' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('executions')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'executions' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Executions
                    </button>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLogs(!showLogs)}
                    className={showLogs ? 'bg-accent' : ''}
                >
                    <Code className="h-4 w-4 mr-2" />
                    Logs
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleActive}
                    className={isActive ? 'border-primary/50 text-primary hover:bg-primary/10' : ''}
                >
                    <Zap className="h-3 w-3 mr-2" />
                    {isActive ? 'Active' : 'Activate'}
                </Button>

                <Button
                    size="sm"
                    variant="outline"
                    onClick={onSave}
                    disabled={isSaving}
                    className={saveStatus === 'saved' && !isDirty ? 'border-green-500/50 text-green-600' : ''}
                >
                    {renderSaveButton()}
                </Button>

                <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                </Button>
            </div>
        </header>
    )
})

CanvasHeader.displayName = 'CanvasHeader'
