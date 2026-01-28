'use client'

/**
 * Base Trigger Node Component (Refactored)
 * 
 * Clean, minimal inverted-D shaped trigger node.
 * Reduced from 377 lines to ~200 lines using shared core components.
 */

import { memo, useState, ReactNode, useMemo } from 'react'
import { Position, NodeProps, useReactFlow } from 'reactflow'
import { ChevronDown } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { QuickAddButton } from '../QuickAddButton'
import { validateNodeConfig } from '../../utils/nodeValidation'
import { useNodeTypes } from '@/services/queries/workflows'
import { NodeTypeDefinition } from '@/types'
import {
    NodeHandle,
    NodeToolbar,
    ValidationBadge,
    StatusIndicator,
    RunningBorder,
    NodeNotes
} from '../core'

export interface BaseTriggerNodeData {
    label: string
    description?: string
    icon?: string
    icon_svg?: string
    node_name?: string
    status?: 'idle' | 'running' | 'success' | 'failed' | 'pending' | 'warning'
    config?: Record<string, any>
    spec?: Record<string, any>
    workflowId?: string
    executeNode?: (nodeId?: string) => Promise<void>
    settings?: {
        notes?: string
        displayNoteInFlow?: boolean
        [key: string]: any
    }
}

export interface TriggerNodeConfig {
    icon: React.ComponentType<any>
    color: string
    detailsContent?: (data: BaseTriggerNodeData) => ReactNode
    isConnected?: (data: BaseTriggerNodeData) => boolean
}

interface BaseTriggerNodeProps extends NodeProps<BaseTriggerNodeData> {
    config: TriggerNodeConfig
}

export const BaseTriggerNode = memo((props: BaseTriggerNodeProps) => {
    const { data, isConnectable, selected, id, config } = props
    const [showToolbar, setShowToolbar] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const { setNodes, setEdges } = useReactFlow()
    const { toast } = useToast()
    const { data: nodeTypes = [] } = useNodeTypes()

    // Find the specific definition for this node type
    const nodeTypeDefinition = (nodeTypes as NodeTypeDefinition[]).find(
        t => t.name === data.node_name
    )

    // Status flags
    const isRunning = data.status === 'running'
    const hasSuccess = data.status === 'success'
    const isFailed = data.status === 'failed'
    const isPending = data.status === 'pending'

    // Validate node configuration
    const validation = useMemo(() => {
        return validateNodeConfig(
            data.node_name || '',
            data.config || {},
            data.spec || {},
            nodeTypeDefinition
        )
    }, [data.node_name, data.config, data.spec, nodeTypeDefinition])

    const Icon = config.icon

    // Handlers
    const handleExecute = async () => {
        if (data.executeNode) {
            await data.executeNode(id)
        } else {
            toast({ title: "Error", description: "Execute function not available", variant: "destructive" })
        }
    }

    const handleTogglePause = () => setIsPaused(!isPaused)

    const handleDelete = () => {
        setNodes((nds) => nds.filter((node) => node.id !== id))
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
    }

    // Inverted-D border radius
    const triggerBorderRadius = '44px 12px 12px 44px'

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowToolbar(true)}
            onMouseLeave={() => setShowToolbar(false)}
        >
            {/* Shared Toolbar Component */}
            <NodeToolbar
                show={showToolbar}
                isRunning={isRunning}
                isPending={isPending}
                isPaused={isPaused}
                onExecute={handleExecute}
                onTogglePause={handleTogglePause}
                onDelete={handleDelete}
            />

            {/* Inverted-D Shape Node Design */}
            <div className="flex flex-col items-center gap-2 group/node">
                <div className="relative">
                    {/* Node Body */}
                    <div
                        className={cn(
                            "relative w-24 h-20 bg-card/90 backdrop-blur-xl border-2 transition-all duration-300 overflow-hidden",
                            selected ? "border-primary ring-4 ring-primary/20" : "border-border hover:border-border-strong",
                            hasSuccess && "border-emerald-500 ring-4 ring-emerald-500/10",
                            isFailed && "border-destructive ring-4 ring-destructive/10",
                            isRunning ? "border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "shadow-xl"
                        )}
                        style={{
                            borderRadius: triggerBorderRadius,
                            background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/0.95) 100%)`,
                        }}
                    >
                        {/* Running Animation */}
                        <RunningBorder
                            color={config.color}
                            borderRadius="46px 14px 14px 46px"
                            isRunning={isRunning}
                        />

                        {/* Icon Container */}
                        <div
                            className={cn(
                                "w-full h-full flex items-center justify-center relative overflow-hidden z-10 bg-card/90",
                                isRunning && "m-[1px] w-[calc(100%-2px)] h-[calc(100%-2px)]"
                            )}
                            style={{ borderRadius: '42px 10px 10px 42px' }}
                        >
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundColor: config.color }} />
                            <motion.div
                                animate={isRunning ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Icon className="h-9 w-9" style={{ color: config.color }} />
                            </motion.div>
                        </div>

                        {/* Status Indicator */}
                        {(hasSuccess || isFailed) && (
                            <div className="absolute -top-1 -right-1 flex items-center justify-center">
                                <StatusIndicator status={data.status || 'idle'} />
                            </div>
                        )}

                        {/* Details Toggle */}
                        {config.detailsContent && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails) }}
                                className="absolute bottom-1.5 left-2 p-1 rounded-full hover:bg-background/20 transition-colors z-20"
                            >
                                <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-300", showDetails && "rotate-180")} />
                            </button>
                        )}
                    </div>

                    {/* Validation Badge */}
                    {!validation.isValid && !isRunning && !hasSuccess && (
                        <ValidationBadge warnings={validation.warnings} position="top-right" size="sm" />
                    )}

                    {/* Output Handle (Triggers only have output) */}
                    <NodeHandle
                        type="source"
                        position={Position.Right}
                        handleId="output"
                        isConnectable={isConnectable}
                        color={config.color}
                    />

                    {/* Quick Add Button */}
                    <QuickAddButton nodeId={id} color={config.color} />
                </div>

                {/* Label & Subtitle */}
                <div className="flex flex-col items-center px-1 max-w-[120px]">
                    <span className="text-[11px] font-bold text-foreground text-center line-clamp-1">
                        {data.label}
                    </span>
                    {data.node_name && (
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono opacity-60">
                            {data.node_name.split('.')[0]}
                        </span>
                    )}
                </div>

                {/* Details Panel */}
                <AnimatePresence>
                    {showDetails && config.detailsContent && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="w-full max-w-[140px] mt-2 overflow-hidden"
                        >
                            <div className="p-2.5 rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-sm space-y-2">
                                {config.detailsContent(data)}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Note Display */}
            <NodeNotes
                notes={data.settings?.notes}
                displayInFlow={data.settings?.displayNoteInFlow}
                marginTop="mt-10"
            />
        </div>
    )
})

BaseTriggerNode.displayName = 'BaseTriggerNode'
