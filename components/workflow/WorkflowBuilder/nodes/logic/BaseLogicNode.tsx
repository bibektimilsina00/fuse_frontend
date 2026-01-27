'use client'

/**
 * Base Logic/Condition Node Component (Refactored)
 * 
 * A premium, symmetric rounded square design for logic.
 * Features dual color-coded outputs (True/False) on the right.
 * Reduced from 367 lines to ~200 lines using shared core components.
 */

import { memo, useState, ReactNode } from 'react'
import { Position, NodeProps, useReactFlow } from 'reactflow'
import { ChevronDown, Check, X, Split } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { QuickAddButton } from '../QuickAddButton'
import { validateNodeConfig } from '../../utils/nodeValidation'
import { NodeHandle, NodeToolbar, RunningBorder, ValidationBadge } from '../core'
import { useNodeTypes } from '@/services/queries/workflows'
import { NodeTypeDefinition } from '@/types'

export interface BaseLogicNodeData {
    label: string
    description?: string
    status?: 'idle' | 'running' | 'success' | 'failed' | 'pending' | 'warning'
    config?: Record<string, any>
    spec?: Record<string, any>
    workflowId?: string
    executeNode?: (nodeId?: string) => Promise<void>
    node_name?: string
    icon?: string
    icon_svg?: string
}

export interface LogicNodeConfig {
    icon?: React.ComponentType<any>
    color?: string
    detailsContent?: (data: BaseLogicNodeData) => ReactNode
}

interface BaseLogicNodeProps extends NodeProps<BaseLogicNodeData> {
    config?: LogicNodeConfig
}

export const BaseLogicNode = memo((props: BaseLogicNodeProps) => {
    const { data, isConnectable, selected, id, config = {} } = props
    const [showToolbar, setShowToolbar] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const { setNodes, setEdges } = useReactFlow()
    const { data: nodeTypes = [] } = useNodeTypes()

    // Find the specific definition for this node type
    const nodeTypeDefinition = (nodeTypes as NodeTypeDefinition[]).find(
        t => t.name === data.node_name
    )

    // Validate node configuration
    const validation = validateNodeConfig(
        data.node_name || '',
        data.config || {},
        data.spec || {},
        nodeTypeDefinition
    )

    const Icon = config.icon || Split
    const color = config.color || '#8b5cf6' // Premium Logic Purple

    // Determine if this is a branching node (has True/False)
    const isBranching = data.node_name?.includes('condition') ||
        data.node_name?.includes('if') ||
        data.node_name?.includes('switch') ||
        data.node_name?.includes('parallel')

    const isRunning = data.status === 'running'
    const isPending = data.status === 'pending'

    // Handlers
    const handleExecute = () => {
        // TODO: Implement execute logic for logic nodes
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

            {/* Validation Badge */}
            <ValidationBadge warnings={validation.warnings} />

            {/* Premium Rounded Square Logic Design */}
            <div className="flex flex-col items-center gap-2 group/node">
                <div className="relative">
                    <div
                        className={cn(
                            "relative w-24 h-24 bg-card/90 backdrop-blur-xl border-2 transition-all duration-300 shadow-xl overflow-hidden",
                            selected ? "border-primary ring-4 ring-primary/20" : "border-border hover:border-border-strong",
                            isPaused && "opacity-60",
                            isRunning && "border-primary shadow-[0_0_25px_rgba(139,92,246,0.3)]"
                        )}
                        style={{
                            borderRadius: '28px',
                            background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/0.95) 100%)`,
                        }}
                    >
                        {/* Running Animation */}
                        <RunningBorder color={color} borderRadius="30px" isRunning={isRunning} />

                        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden rounded-[26px] z-10">
                            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundColor: color }} />
                            <motion.div
                                animate={isRunning ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Icon className="h-10 w-10 relative z-10" style={{ color: color }} />
                            </motion.div>

                            {/* Visual flow labels for conditional nodes */}
                            {(data.node_name?.includes('condition') || data.node_name?.includes('if') || data.node_name?.includes('switch')) && (
                                <div className="absolute inset-y-0 right-1 flex flex-col justify-around py-4 opacity-40 group-hover/node:opacity-100 transition-opacity">
                                    <Check className="h-3 w-3 text-emerald-500" />
                                    <X className="h-3 w-3 text-rose-500" />
                                </div>
                            )}
                        </div>

                        {/* Details Toggle */}
                        {config.detailsContent && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails) }}
                                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 p-1 bg-background border border-border rounded-full shadow-sm hover:bg-accent transition-colors z-20"
                            >
                                <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-300", showDetails && "rotate-180")} />
                            </button>
                        )}
                    </div>

                    {/* Input Handle */}
                    <NodeHandle
                        type="target"
                        position={Position.Left}
                        handleId="input"
                        isConnectable={isConnectable}
                        color="#9ca3af"
                    />

                    {/* Output Handles - Branching vs Linear */}
                    {isBranching ? (
                        <>
                            {/* True Handle */}
                            <NodeHandle
                                type="source"
                                position={Position.Right}
                                handleId="true"
                                isConnectable={isConnectable}
                                color="#10b981"
                                style={{ top: '30%', transform: 'translateY(-50%)' }}
                            />
                            {/* False Handle */}
                            <NodeHandle
                                type="source"
                                position={Position.Right}
                                handleId="false"
                                isConnectable={isConnectable}
                                color="#f43f5e"
                                style={{ top: '70%', transform: 'translateY(-50%)' }}
                            />
                            <QuickAddButton nodeId={id} handleId="true" color="#10b981" style={{ top: '30%' }} />
                            <QuickAddButton nodeId={id} handleId="false" color="#f43f5e" style={{ top: '70%' }} />
                        </>
                    ) : (
                        <>
                            <NodeHandle
                                type="source"
                                position={Position.Right}
                                handleId="true"
                                isConnectable={isConnectable}
                                color="#9ca3af"
                            />
                            <QuickAddButton nodeId={id} handleId="true" color={color} style={{ top: '50%' }} />
                        </>
                    )}
                </div>

                {/* Label */}
                <div className="flex flex-col items-center px-1 max-w-[140px]">
                    <span className="text-[11px] font-bold text-foreground text-center line-clamp-1">
                        {data.label}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono opacity-50">
                        {data.node_name?.split('.')[0] || 'Condition'}
                    </span>
                </div>

                {/* Details Panel */}
                <AnimatePresence>
                    {showDetails && config.detailsContent && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="w-full max-w-[150px] mt-1 overflow-hidden"
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

BaseLogicNode.displayName = 'BaseLogicNode'
