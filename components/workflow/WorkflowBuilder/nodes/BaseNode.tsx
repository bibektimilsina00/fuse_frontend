'use client'

/**
 * Base Node Component
 * 
 * Standard rectangular node with rounded corners for actions, logic, and AI nodes.
 * Supports input (left) and output (right) handles.
 */

import { memo, useState, useMemo } from 'react'
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow'
import {
    Trash2, Play, Settings, Zap, Brain, MessageSquare, Database, Bot, Globe, Code,
    PlayCircle, CalendarClock, Webhook, Inbox, ClipboardList, Rss, Send, Hash,
    FileSpreadsheet, Split, Shuffle, GitMerge, RotateCw, PauseCircle, Clock, Sparkles,
    Edit3, Activity, GitBranch, Timer, FileText, Loader2, AlertTriangle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { IconRenderer } from '../utils/iconMap'
import { cn } from '@/lib/utils'
import { QuickAddButton } from './QuickAddButton'
import { validateNodeConfig, getValidationSummary } from '../utils/nodeValidation'
import { useNodeTypes } from '@/services/queries/workflows'
import { NodeTypeDefinition } from '@/types'

export interface BaseNodeData {
    label: string
    description?: string
    icon?: string
    icon_svg?: string
    status?: 'idle' | 'running' | 'success' | 'failed' | 'pending' | 'warning'
    config?: Record<string, any>
    spec?: Record<string, any>
    settings?: {
        notes?: string
        displayNoteInFlow?: boolean
        [key: string]: any
    }
    type?: 'action' | 'logic' | 'ai' | 'trigger'
    node_name?: string
    workflowId?: string
    executeNode?: (nodeId?: string) => Promise<void>
    error?: string
    errorCategory?: string
    errorSuggestion?: string
}

export interface BaseNodeProps extends NodeProps<BaseNodeData> {
    // Optional overrides
    icon?: React.ComponentType<any>
    color?: string
}

export const BaseNode = memo((props: BaseNodeProps) => {
    const { data, isConnectable, selected, id } = props
    const [showToolbar, setShowToolbar] = useState(false)
    const [isHoveringInput, setIsHoveringInput] = useState(false)
    const [isHoveringOutput, setIsHoveringOutput] = useState(false)
    const [showWarningTooltip, setShowWarningTooltip] = useState(false)
    const [showErrorTooltip, setShowErrorTooltip] = useState(false)
    const { setNodes, setEdges } = useReactFlow()

    const isRunning = data.status === 'running'
    const hasSuccess = data.status === 'success'
    const isFailed = data.status === 'failed'
    const isPending = data.status === 'pending'
    const hasWarning = data.status === 'warning'

    // Fetch node types for validation
    const { data: nodeTypes = [] } = useNodeTypes()
    const nodeTypeDefinition = (nodeTypes as NodeTypeDefinition[]).find(
        t => t.name === data.node_name
    )

    // Validate node configuration
    const validation = useMemo(() => {
        return validateNodeConfig(
            data.node_name || '',
            data.config || {},
            data.spec || {},
            nodeTypeDefinition
        )
    }, [data.node_name, data.config, data.spec, nodeTypeDefinition])

    const validationSummary = useMemo(() => {
        return getValidationSummary(validation)
    }, [validation])

    const handleDelete = () => {
        setNodes((nds) => nds.filter((node) => node.id !== id))
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
    }

    const { toast } = useToast()

    const handleExecute = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (data.executeNode) {
            await data.executeNode(id)
        } else {
            toast({ title: "Error", description: "Execute function not available", variant: "destructive" })
        }
    }

    // Centralized icon mapping based on node name
    const getIcon = () => {
        if (props.icon) return <props.icon className="h-5 w-5" />

        return (
            <IconRenderer
                icon={data.spec?.icon || data.icon}
                icon_svg={data.spec?.icon_svg || data.icon_svg}
                className="h-5 w-5"
                fallback={data.type === 'trigger' ? Zap : Settings}
            />
        )
    }

    const nodeColor = props.color || (data.type === 'trigger' ? '#ef4444' : '#3b82f6')

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowToolbar(true)}
            onMouseLeave={() => setShowToolbar(false)}
        >

            {/* Hover Toolbar */}
            <AnimatePresence>
                {showToolbar && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-slate-800 border border-border rounded-lg px-2 py-1.5 shadow-xl z-50"
                    >
                        <button
                            onClick={handleExecute}
                            disabled={isRunning || isPending}
                            className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors text-muted-foreground hover:text-green-600 disabled:opacity-50"
                            title={isRunning ? "Running..." : "Run this node"}
                        >
                            {isRunning || isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </button>
                        <div className="w-px h-4 bg-border" />
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-muted-foreground hover:text-red-600"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Node Card */}
            <div
                className={cn(
                    "min-w-[180px] bg-white dark:bg-slate-900 border-2 rounded-xl shadow-sm transition-all relative",
                    selected ? "border-primary shadow-md" : "border-border",
                    isRunning && "border-transparent shadow-xl ring-1 ring-primary/10",
                    isPending && "border-blue-400 border-dashed",
                    hasSuccess && "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.25)]",
                    isFailed && "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]",
                    hasWarning && "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
                    !validation.isValid && !hasSuccess && !isFailed && !isRunning && "border-amber-300"
                )}
            >
                {/* Error Badge */}
                {isFailed && (
                    <div
                        className="absolute -top-2 -right-2 z-20"
                        onMouseEnter={() => setShowErrorTooltip(true)}
                        onMouseLeave={() => setShowErrorTooltip(false)}
                    >
                        <div className="relative">
                            <div className="bg-red-500 text-white p-1 rounded-full shadow-lg cursor-help">
                                <AlertTriangle className="h-3.5 w-3.5" />
                            </div>

                            {/* Error Tooltip */}
                            <AnimatePresence>
                                {showErrorTooltip && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-2 z-50"
                                    >
                                        <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[200px] max-w-[280px]">
                                            <div className="font-semibold text-red-400 mb-1.5 flex items-center gap-1.5">
                                                <AlertTriangle className="h-3 w-3" />
                                                Execution Failed
                                            </div>
                                            <div className="text-slate-200 mb-2 whitespace-pre-wrap leading-relaxed">
                                                {data.error || "An unexpected error occurred during execution."}
                                            </div>
                                            {data.errorSuggestion && (
                                                <div className="mt-2 pt-2 border-t border-slate-700/50">
                                                    <div className="text-blue-400 font-medium mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                                                        <Sparkles className="h-2.5 w-2.5" />
                                                        Suggestion
                                                    </div>
                                                    <div className="text-slate-300 italic">
                                                        {data.errorSuggestion}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Arrow */}
                                        <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-900 rotate-45" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Warning Badge */}
                {!validation.isValid && !isRunning && !hasSuccess && !isFailed && (
                    <div
                        className="absolute -top-2 -right-2 z-20"
                        onMouseEnter={() => setShowWarningTooltip(true)}
                        onMouseLeave={() => setShowWarningTooltip(false)}
                    >
                        <div className="relative">
                            <div className="bg-amber-500 text-white p-1 rounded-full shadow-lg cursor-help animate-pulse">
                                <AlertTriangle className="h-3.5 w-3.5" />
                            </div>

                            {/* Tooltip */}
                            <AnimatePresence>
                                {showWarningTooltip && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-2 z-50"
                                    >
                                        <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[160px] max-w-[220px]">
                                            <div className="font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
                                                <AlertTriangle className="h-3 w-3" />
                                                Configuration Needed
                                            </div>
                                            <ul className="space-y-1 text-slate-300">
                                                {validation.warnings.map((w, i) => (
                                                    <li key={i} className="flex items-start gap-1.5">
                                                        <span className="text-amber-400 mt-0.5">•</span>
                                                        <span>{w.message}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {/* Arrow */}
                                        <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-900 rotate-45" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
                {/* Running Border Animation */}
                {isRunning && (
                    <div className="absolute inset-[-2px] overflow-hidden rounded-[14px] z-0 pointer-events-none">
                        <motion.div
                            className="absolute inset-[-250%]"
                            animate={{ rotate: [0, 360] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{
                                background: `conic-gradient(from 0deg, transparent 0deg, ${nodeColor} 15deg, transparent 30deg, ${nodeColor} 180deg, transparent 195deg)`,
                            }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className={cn(
                    "flex items-center gap-3 p-3 relative z-10 rounded-xl bg-white dark:bg-slate-900",
                    isRunning && "m-[1px] p-[11px]" // Slightly smaller to reveal the animated border
                )}>
                    <div
                        className="p-2 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: nodeColor }}
                    >
                        {getIcon()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate leading-tight">
                            {data.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-medium mt-0.5">
                            {data.node_name || data.type || 'Action'}
                        </div>
                    </div>

                    {isRunning && (
                        <div className="flex space-x-0.5">
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                            />
                        </div>
                    )}
                </div>

                {/* Status bar at bottom */}
                {(hasSuccess || isFailed) && (
                    <div className={cn(
                        "h-1 w-full",
                        hasSuccess ? "bg-green-500" : "bg-red-500"
                    )} />
                )}

                {/* Premium Input Handle */}
                {data.type !== 'trigger' && (
                    <Handle
                        type="target"
                        position={Position.Left}
                        isConnectable={isConnectable}
                        className="!w-4 !h-4 !bg-transparent !border-none z-50 p-0"
                        style={{ left: '-8px', top: '50%', transform: 'translateY(-50%)' }}
                        onMouseEnter={() => setIsHoveringInput(true)}
                        onMouseLeave={() => setIsHoveringInput(false)}
                    >
                        <motion.div
                            className="w-full h-full relative flex items-center justify-center pointer-events-none"
                            animate={isHoveringInput ? 'hover' : 'initial'}
                            initial="initial"
                        >
                            <motion.div
                                variants={{
                                    initial: { scale: 1, opacity: 0 },
                                    hover: { scale: 2, opacity: 0.4, transition: { repeat: Infinity, duration: 1 } }
                                }}
                                className="absolute inset-0 rounded-full bg-slate-400"
                            />
                            <motion.div
                                variants={{
                                    initial: { scale: 1 },
                                    hover: { scale: 1.25 }
                                }}
                                className="w-full h-full rounded-full border-2 border-white dark:border-slate-700 bg-slate-400 shadow-md relative z-10"
                            >
                                <div className="absolute top-0.5 left-0.5 w-[30%] h-[30%] bg-white rounded-full opacity-40" />
                            </motion.div>
                        </motion.div>
                    </Handle>
                )}

                {/* Quick Add Button */}
                <QuickAddButton
                    nodeId={id}
                    color={nodeColor}
                />

                {/* Premium Output Handle */}
                <Handle
                    type="source"
                    position={Position.Right}
                    isConnectable={isConnectable}
                    className="!w-4 !h-4 !bg-transparent !border-none z-50 p-0"
                    style={{
                        right: '-8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                    onMouseEnter={() => setIsHoveringOutput(true)}
                    onMouseLeave={() => setIsHoveringOutput(false)}
                >
                    <motion.div
                        className="w-full h-full relative flex items-center justify-center pointer-events-none"
                        animate={isHoveringOutput ? 'hover' : 'initial'}
                        initial="initial"
                    >
                        <motion.div
                            variants={{
                                initial: { scale: 1, opacity: 0 },
                                hover: { scale: 2, opacity: 0.4, transition: { repeat: Infinity, duration: 1 } }
                            }}
                            className="absolute inset-0 rounded-full"
                            style={{ backgroundColor: nodeColor }}
                        />
                        <motion.div
                            variants={{
                                initial: { scale: 1 },
                                hover: { scale: 1.25 }
                            }}
                            className="w-full h-full rounded-full border-2 border-white dark:border-slate-700 shadow-md relative z-10"
                            style={{ backgroundColor: nodeColor }}
                        >
                            <div className="absolute top-0.5 left-0.5 w-[30%] h-[30%] bg-white rounded-full opacity-40" />
                        </motion.div>
                    </motion.div>
                </Handle>
            </div>

            {/* Note Display Overlay */}
            {data.settings?.displayNoteInFlow && data.settings?.notes && (
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-full min-w-[120px] max-w-[200px] z-0">
                    <div className="bg-amber-50/50 dark:bg-amber-900/20 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/30 rounded-lg p-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex items-start gap-1.5">
                            <FileText className="w-2.5 h-2.5 text-amber-500/50 mt-0.5 shrink-0" />
                            <p className="text-[9px] text-amber-900/70 dark:text-amber-100/50 font-medium leading-relaxed italic line-clamp-3">
                                {data.settings.notes}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
})

BaseNode.displayName = 'BaseNode'
