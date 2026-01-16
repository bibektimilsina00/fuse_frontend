import * as React from 'react'
import { motion } from 'framer-motion'
import {
    MoreVertical,
    Play,
    Pause,
    Edit,
    Trash2,
    Copy,
    Clock,
    CheckCircle2,
    Calendar
} from 'lucide-react'
import { Workflow } from '@/types/workflow'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={cn(
                "group relative overflow-hidden transition-all hover:shadow-md border-border/50 hover:border-border",
                viewMode === 'list' ? "flex items-center gap-6" : ""
            )}>
                {/* Status Indicator Line */}
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 transition-colors",
                    isActive ? "bg-green-500" : "bg-muted"
                )} />

                <div className={cn("flex-1", viewMode === 'list' ? "flex items-center justify-between gap-6" : "")}>
                    {/* Header Info */}
                    <div className={cn("mb-4", viewMode === 'list' && "mb-0 flex-1")}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight mb-1 group-hover:text-primary transition-colors">
                                    {workflow.name}
                                </h3>
                                {workflow.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {workflow.description}
                                    </p>
                                )}
                            </div>
                            {viewMode === 'grid' && (
                                <WorkflowActions
                                    onEdit={() => onEdit(workflow.id)}
                                    onDuplicate={() => onDuplicate(workflow.id)}
                                    onDelete={() => onDelete(workflow.id)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className={cn(
                        "flex items-center gap-4 text-sm text-muted-foreground",
                        viewMode === 'grid' ? "mb-4 pb-4 border-b border-border/50" : ""
                    )}>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{workflow.nodes.length} steps</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Actions Footer (Grid only) */}
                    {viewMode === 'grid' && (
                        <div className="flex items-center justify-between">
                            <div className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                                isActive
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                    : "bg-muted text-muted-foreground"
                            )}>
                                <div className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-green-500" : "bg-slate-400")} />
                                {isActive ? 'Active' : 'Inactive'}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onToggle(workflow.id)}
                                    className={isActive ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                                >
                                    {isActive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                                    {isActive ? 'Pause' : 'Run'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onEdit(workflow.id)}
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* List View Actions */}
                    {viewMode === 'list' && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onToggle(workflow.id)}
                            >
                                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <WorkflowActions
                                onEdit={() => onEdit(workflow.id)}
                                onDuplicate={() => onDuplicate(workflow.id)}
                                onDelete={() => onDelete(workflow.id)}
                            />
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    )
}

function WorkflowActions({ onEdit, onDuplicate, onDelete }: { onEdit: () => void, onDuplicate: () => void, onDelete: () => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
