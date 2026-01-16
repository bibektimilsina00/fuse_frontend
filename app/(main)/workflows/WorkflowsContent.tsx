'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sparkles, Plus, Workflow as WorkflowIcon, FolderOpen, Zap, Clock, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { WorkflowsToolbar } from './components/WorkflowsToolbar'
import { WorkflowCard } from '@/components/workflow'
import { TemplateLibrary } from '@/components/template'
import { useWorkflowsPage } from './hooks/useWorkflowsPage'
import { AICreateDialog } from '@/components/ai'
import { logger } from '@/lib/logger'

export function WorkflowsContent() {
    const searchParams = useSearchParams()
    const {
        workflows,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        handleEdit,
        handleDelete,
        handleToggle,
        handleDuplicate,
        handleCreateNew,
        showAIDialog,
        handleOpenAIDialog,
        handleCloseAIDialog,
        handleGenerateWithAI,
        deleteConfirmOpen,
        setDeleteConfirmOpen,
        workflowToDelete,
        confirmDelete,
    } = useWorkflowsPage()

    const [activeTab, setActiveTab] = useState('workflows')

    // Auto-open AI dialog if openAI query param is present
    useEffect(() => {
        if (searchParams.get('openAI') === 'true') {
            handleOpenAIDialog()
        }
    }, [searchParams, handleOpenAIDialog])

    // Calculate stats
    const activeWorkflows = workflows.filter(w => w.meta.status === 'active').length
    const totalExecutions = workflows.length * 1000 // Mock data
    const avgExecutionTime = '1.2s'

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="text-red-500 text-lg font-semibold">Error loading workflows</div>
                <div className="text-sm text-muted-foreground">{error.message}</div>
                <div className="text-xs text-muted-foreground bg-muted p-4 rounded-lg max-w-2xl">
                    <p className="font-mono">{JSON.stringify(error, null, 2)}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage your automation workflows
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <AICreateDialog
                        open={showAIDialog}
                        onOpenChange={handleCloseAIDialog}
                        onSubmit={handleGenerateWithAI}
                        className="hidden md:flex"
                    />
                    <Button onClick={handleCreateNew} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        New Workflow
                    </Button>
                </div>
            </div>

            {/* Main Content with Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <TabsList>
                        <TabsTrigger value="workflows" className="flex items-center gap-2">
                            <WorkflowIcon className="h-4 w-4" />
                            My Workflows
                        </TabsTrigger>
                        <TabsTrigger value="templates" className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            Templates
                        </TabsTrigger>
                    </TabsList>

                    <WorkflowsToolbar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />
                </div>

                <TabsContent value="workflows" className="space-y-6">
                    {workflows.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                No workflows yet
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                Create your first workflow to get started with automation
                            </p>
                            <Button onClick={handleCreateNew}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Workflow
                            </Button>
                        </div>
                    ) : (
                        <div
                            className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                    : 'space-y-4'
                            }
                        >
                            <AnimatePresence>
                                {workflows.map((workflow) => (
                                    <WorkflowCard
                                        key={workflow.id}
                                        workflow={{
                                            id: workflow.id.toString(),
                                            name: workflow.meta.name,
                                            description: workflow.meta.description,
                                            status: workflow.meta.status as 'active' | 'inactive' | 'draft',
                                            nodes: (workflow.graph?.nodes || []) as any[],
                                            edges: workflow.graph?.edges || [],
                                            tags: workflow.meta.tags || [],
                                            createdAt: workflow.meta.created_at,
                                            updatedAt: workflow.meta.updated_at,
                                        }}
                                        viewMode={viewMode}
                                        onEdit={() => handleEdit(workflow.id)}
                                        onDelete={() => handleDelete(workflow.id)}
                                        onToggle={() => handleToggle(workflow.id)}
                                        onDuplicate={() => handleDuplicate(workflow.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="templates">
                    <TemplateLibrary
                        onUseTemplate={(template) => {
                            // Handle template usage
                            logger.info('Using template:', template)
                        }}
                    />
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Delete Workflow"
                description={`Are you sure you want to delete "${workflows.find(w => w.id === workflowToDelete)?.meta.name || 'this workflow'}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                variant="danger"
            />

        </div>
    )
}
