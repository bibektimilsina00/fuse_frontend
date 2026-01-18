import * as React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    MoreVertical,
    Play,
    Pause,
    Edit,
    Trash2,
    Copy,
    Clock,
    CheckCircle2,
    Calendar,
    User,
    Tag,
    ExternalLink,
    Zap
} from 'lucide-react'
import { Workflow } from '@/types/workflow'
import { Button } from '@/components/ui/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/utils'

interface WorkflowCardProps {
    workflow: Workflow
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onToggle: (id: string) => void
    onDuplicate: (id: string) => void
    viewMode?: 'grid' | 'list'
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
    workflow,
    onEdit,
    onDelete,
    onToggle,
    onDuplicate,
    viewMode = 'grid'
}) => {
    const isActive = workflow.status === 'active'
    const isDraft = workflow.status === 'draft'

    if (viewMode === 'list') {
        return null // List view is handled by WorkflowRow in WorkflowsContent
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
                {/* Status Indicator Line */}
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 transition-colors",
                    isActive && "bg-emerald-500",
                    isDraft && "bg-amber-500",
                    !isActive && !isDraft && "bg-slate-400"
                )} />

                {/* Card Content */}
                <div className="p-5 pl-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                            <Link
                                href={`/workflows/${workflow.id}`}
                                className="block"
                            >
                                <h3 className="text-base font-semibold tracking-tight mb-1 group-hover:text-primary transition-colors truncate">
                                    {workflow.name}
                                </h3>
                            </Link>
                            {workflow.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {workflow.description}
                                </p>
                            )}
                        </div>
                        <WorkflowActions
                            workflowId={workflow.id}
                            isActive={isActive}
                            onEdit={() => onEdit(workflow.id)}
                            onDuplicate={() => onDuplicate(workflow.id)}
                            onDelete={() => onDelete(workflow.id)}
                            onToggle={() => onToggle(workflow.id)}
                        />
                    </div>

                    {/* Tags */}
                    {workflow.tags && workflow.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                            {workflow.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground"
                                >
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                </span>
                            ))}
                            {workflow.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                    +{workflow.tags.length - 3} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pb-4 mb-4 border-b border-border">
                        <div className="flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5" />
                            <span>{workflow.nodes?.length || 0} nodes</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        {/* Status Badge */}
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                            isActive && "status-active",
                            isDraft && "status-draft",
                            !isActive && !isDraft && "status-inactive"
                        )}>
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                isActive && "bg-emerald-500",
                                isDraft && "bg-amber-500",
                                !isActive && !isDraft && "bg-slate-400"
                            )} />
                            {isActive ? 'Active' : isDraft ? 'Draft' : 'Inactive'}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggle(workflow.id)}
                                className={cn(
                                    "h-8 px-3",
                                    isActive
                                        ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                        : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                )}
                            >
                                {isActive ? <Pause className="h-3.5 w-3.5 mr-1.5" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}
                                {isActive ? 'Pause' : 'Run'}
                            </Button>
                            <Link href={`/workflows/${workflow.id}`}>
                                <Button size="sm" variant="outline" className="h-8 px-3">
                                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                                    Edit
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function WorkflowActions({
    workflowId,
    isActive,
    onEdit,
    onDuplicate,
    onDelete,
    onToggle
}: {
    workflowId: string
    isActive: boolean
    onEdit: () => void
    onDuplicate: () => void
    onDelete: () => void
    onToggle: () => void
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Workflow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggle}>
                    {isActive ? (
                        <>
                            <Pause className="h-4 w-4 mr-2" />
                            Deactivate
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4 mr-2" />
                            Activate
                        </>
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
