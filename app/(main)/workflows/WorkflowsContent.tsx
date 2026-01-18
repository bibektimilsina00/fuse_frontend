'use client'

import { useState } from 'react'
import {
    Sparkles,
    Plus,
    Workflow as WorkflowIcon,
    FolderOpen,
    Zap,
    Search,
    Filter,
    ChevronDown,
    Grid3X3,
    List,
    MoreHorizontal,
    Play,
    User,
    Calendar
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { WorkflowCard } from '@/components/workflow'
import { TemplateLibrary } from '@/components/template'
import { useWorkflowsPage } from './hooks/useWorkflowsPage'
import { useAIAssistant } from '@/components/providers'
import { logger } from '@/lib/logger'
import Link from 'next/link'

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

// Workflow Row Component for list view
function WorkflowRow({
    workflow,
    onEdit,
    onDelete,
    onToggle,
    onDuplicate
}: {
    workflow: any
    onEdit: () => void
    onDelete: () => void
    onToggle: () => void
    onDuplicate: () => void
}) {
    const [showActions, setShowActions] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="workflow-row group"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Status Indicator */}
                <div className={cn(
                    "h-2.5 w-2.5 rounded-full shrink-0",
                    workflow.status === 'active' && "bg-emerald-500",
                    workflow.status === 'inactive' && "bg-slate-400",
                    workflow.status === 'draft' && "bg-amber-500"
                )} />

                {/* Workflow Info */}
                <div className="flex-1 min-w-0">
                    <Link
                        href={`/workflows/${workflow.id}`}
                        className="font-medium text-sm hover:text-primary transition-colors truncate block"
                    >
                        {workflow.name}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last updated {new Date(workflow.updatedAt).toLocaleDateString()}
                        </span>
                        <span>|</span>
                        <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Right side - Tags & Actions */}
            <div className="flex items-center gap-4">
                {/* Tags */}
                {workflow.tags && workflow.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                        {workflow.tags.slice(0, 2).map((tag: string) => (
                            <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Owner Badge */}
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    <User className="h-3 w-3" />
                    Personal
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={onToggle}
                    >
                        <Play className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowActions(!showActions)}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}

export function WorkflowsContent() {
    const { openAssistant } = useAIAssistant()
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
        deleteConfirmOpen,
        setDeleteConfirmOpen,
        workflowToDelete,
        confirmDelete,
    } = useWorkflowsPage()

    const [activeTab, setActiveTab] = useState('workflows')
    const [sortBy, setSortBy] = useState('last_updated')

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon bg-red-500/10">
                    <Zap className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-red-500 mb-2">Error loading workflows</h3>
                <p className="text-muted-foreground text-sm mb-4">{error.message}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage your automation workflows
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => openAssistant('create')} 
                        variant="outline"
                        className="shadow-sm border-primary/20 hover:border-primary/40"
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create with AI
                    </Button>
                    <Button onClick={handleCreateNew} className="shadow-lg shadow-primary/25">
                        <Plus className="h-4 w-4 mr-2" />
                        New Workflow
                    </Button>
                </div>
            </div>

            {/* Main Content with Tabs */}
            <div className="space-y-6">
                {/* Tab Navigation & Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('workflows')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                                activeTab === 'workflows'
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <WorkflowIcon className="h-4 w-4" />
                            My Workflows
                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                {workflows.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                                activeTab === 'templates'
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <FolderOpen className="h-4 w-4" />
                            Templates
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search workflows..."
                                className="search-input w-64 !pl-9"
                            />
                        </div>

                        {/* Sort */}
                        <Button variant="outline" size="sm" className="gap-2 h-10">
                            Sort by {sortBy === 'last_updated' ? 'last updated' : 'name'}
                            <ChevronDown className="h-3 w-3" />
                        </Button>

                        {/* Filter */}
                        <Button variant="outline" size="icon" className="h-10 w-10">
                            <Filter className="h-4 w-4" />
                        </Button>

                        {/* View Mode Toggle */}
                        <div className="flex items-center border border-border rounded-lg">
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-10 w-10 rounded-r-none"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-10 w-10 rounded-l-none"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'workflows' && (
                    <>
                        {workflows.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <Plus className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
                                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                                    Create your first workflow to get started with automation
                                </p>
                                <div className="flex items-center gap-3">
                                    <Button onClick={handleCreateNew}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Workflow
                                    </Button>
                                    <Button variant="outline" onClick={() => setActiveTab('templates')}>
                                        <FolderOpen className="h-4 w-4 mr-2" />
                                        Browse Templates
                                    </Button>
                                </div>
                            </div>
                        ) : viewMode === 'list' ? (
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {workflows.map((workflow) => (
                                        <WorkflowRow
                                            key={workflow.id}
                                            workflow={{
                                                id: workflow.id.toString(),
                                                name: workflow.meta.name,
                                                description: workflow.meta.description,
                                                status: workflow.meta.status as 'active' | 'inactive' | 'draft',
                                                tags: workflow.meta.tags || [],
                                                createdAt: workflow.meta.created_at,
                                                updatedAt: workflow.meta.updated_at,
                                            }}
                                            onEdit={() => handleEdit(workflow.id)}
                                            onDelete={() => handleDelete(workflow.id)}
                                            onToggle={() => handleToggle(workflow.id)}
                                            onDuplicate={() => handleDuplicate(workflow.id)}
                                        />
                                    ))}
                                </AnimatePresence>

                                {/* Pagination */}
                                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                                    <span className="text-sm text-muted-foreground">
                                        Total {workflows.length}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" disabled>
                                            ‹
                                        </Button>
                                        <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                            1
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            ›
                                        </Button>
                                        <select className="h-9 px-3 text-sm border border-border rounded-lg bg-background">
                                            <option>50/page</option>
                                            <option>100/page</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    </>
                )}

                {activeTab === 'templates' && (
                    <TemplateLibrary
                        onUseTemplate={(template) => {
                            logger.info('Using template:', template)
                        }}
                    />
                )}
            </div>

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
