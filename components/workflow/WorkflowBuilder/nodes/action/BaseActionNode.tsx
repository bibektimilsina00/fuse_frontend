'use client'

/**
 * Base Action Node Component (Refactored)
 * 
 * A premium, glassmorphic action node using shared core components.
 * Reduced from 353 lines to ~180 lines by using:
 * - NodeToolbar for action buttons
 * - NodeHandle for connections
 * - ValidationBadge for config warnings
 * - StatusIndicator for status display
 * - RunningBorder for execution animation
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
    RunningBorder
} from '../core'

export interface BaseActionNodeData {
    label: string
    description?: string
    icon?: string
    icon_svg?: string
    node_name?: string
    status?: 'idle' | 'running' | 'success' | 'failed' | 'pending' | 'warning'
    config?: Record<string, any>
    spec?: Record<string, any>
    settings?: Record<string, any>
    workflowId?: string
    executeNode?: (nodeId?: string) => Promise<void>
}

export interface ActionNodeConfig {
    icon: React.ComponentType<any>
    color: string
    detailsContent?: (data: BaseActionNodeData) => ReactNode
}

interface BaseActionNodeProps extends NodeProps<BaseActionNodeData> {
    config: ActionNodeConfig
}


// ... existing imports

export const BaseActionNode = memo((props: BaseActionNodeProps) => {
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

            {/* Node Content */}
            <div className="flex flex-col items-center gap-2 group/node">
                <div className="relative">
                    {/* Node Body */}
                    <div
                        className={cn(
                            "relative w-20 h-20 bg-card/90 backdrop-blur-xl border-2 transition-all duration-300 shadow-xl overflow-hidden",
                            selected ? "border-primary ring-4 ring-primary/20" : "border-border hover:border-border-strong",
                            isPaused && "opacity-60",
                            isRunning && "border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]",
                            hasSuccess && "border-emerald-500 ring-4 ring-emerald-500/10",
                            isFailed && "border-destructive ring-4 ring-destructive/10"
                        )}
                        style={{
                            borderRadius: '24px',
                            background: `linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--card)/0.95) 100%)`,
                        }}
                    >
                        {/* Running Animation */}
                        <RunningBorder color={config.color} borderRadius="26px" isRunning={isRunning} />

                        {/* Icon Container */}
                        <div className="w-full h-full flex items-center justify-center relative z-10">
                            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundColor: config.color }} />
                            <Icon className="h-9 w-9 relative z-10" style={{ color: config.color }} />
                        </div>

                        {/* Status Indicator */}
                        <div className="absolute top-2 right-2">
                            <StatusIndicator status={data.status || 'idle'} />
                            {isPaused && <div className="h-2 w-2 rounded-full bg-amber-500 shadow-sm" />}
                        </div>

                        {/* Details Toggle */}
                        {config.detailsContent && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails) }}
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 p-1 bg-background border border-border rounded-full shadow-sm hover:bg-accent transition-colors z-20"
                            >
                                <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-300", showDetails && "rotate-180")} />
                            </button>
                        )}
                    </div>

                    {/* Validation Badge */}
                    {!validation.isValid && !isRunning && !hasSuccess && (
                        <ValidationBadge warnings={validation.warnings} />
                    )}

                    {/* Handles */}
                    <NodeHandle
                        type="target"
                        position={Position.Left}
                        handleId="input"
                        isConnectable={isConnectable}
                        color="#9ca3af"
                    />
                    <NodeHandle
                        type="source"
                        position={Position.Right}
                        handleId="output"
                        isConnectable={isConnectable}
                        color={config.color}
                    />

                    {/* Quick Add */}
                    <QuickAddButton nodeId={id} color={config.color} />
                </div>

                {/* Label */}
                <div className="flex flex-col items-center px-1 max-w-[120px]">
                    <span className="text-[11px] font-bold text-foreground text-center line-clamp-1 group-hover:text-primary transition-colors">
                        {data.label}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono opacity-50">
                        {data.node_name?.split('.')[0] || 'Action'}
                    </span>
                </div>

                {/* Details Panel */}
                <AnimatePresence>
                    {showDetails && config.detailsContent && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="w-full max-w-[140px] mt-1 overflow-hidden"
                        >
                            <div className="p-2.5 rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-sm">
                                {config.detailsContent(data)}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
})

BaseActionNode.displayName = 'BaseActionNode'
