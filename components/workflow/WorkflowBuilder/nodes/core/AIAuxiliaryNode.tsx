'use client'

import { memo, useState } from 'react'
import { Position, NodeProps, useReactFlow } from 'reactflow'
import { cn } from '@/lib/utils'
import { useNodeTypes } from '@/services/queries/workflows'
import { NodeTypeDefinition } from '@/types'
import { IconRenderer } from '../../utils/iconMap'
import { NodeHandle, StatusIndicator, RunningBorder, NodeToolbar } from './'

export const AIAuxiliaryNode = memo(({ data, selected, isConnectable, id }: NodeProps) => {
    const [showToolbar, setShowToolbar] = useState(false)
    const { setNodes, setEdges } = useReactFlow()
    const { data: nodeTypes = [] } = useNodeTypes()

    // Find definition for proper naming
    const definition = (nodeTypes as NodeTypeDefinition[]).find(t => t.name === data.node_name)

    const isRunning = data.status === 'running'
    const isPaused = data.settings?.isPaused || false
    const color = data.color || '#8b5cf6'

    // Display name logic: label (user-set) or definition label
    const displayName = data.label || definition?.label || 'Node'
    // Subtitle logic: category or last part of node_name
    const subtitle = definition?.category?.replace('AI_', '') || data.node_name?.split('.').pop() || 'Node'

    const handleExecute = async () => {
        if (data.executeNode) {
            await data.executeNode(id)
        }
    }

    const handleTogglePause = () => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            settings: {
                                ...node.data.settings,
                                isPaused: !isPaused,
                            },
                        },
                    }
                }
                return node
            })
        )
    }

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
            <NodeToolbar
                show={showToolbar}
                isRunning={isRunning}
                isPaused={isPaused}
                onExecute={handleExecute}
                onTogglePause={handleTogglePause}
                onDelete={handleDelete}
            />

            <div className="flex flex-col items-center gap-2 group">
                <div className="relative w-16 h-16">
                    {/* Circle Background and Content - Strictly clipped */}
                    <div
                        className={cn(
                            "absolute inset-0 rounded-full bg-card/90 backdrop-blur-xl border-2 flex items-center justify-center transition-all duration-300 shadow-xl overflow-hidden",
                            selected ? "border-primary ring-4 ring-primary/20 scale-110" : "border-border hover:border-border-strong hover:scale-105",
                            isRunning && "border-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]",
                            isPaused && "opacity-60"
                        )}
                    >
                        <RunningBorder color={color} isRunning={isRunning} borderRadius="100%" />
                        <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundColor: color }} />
                        <IconRenderer
                            icon={data.spec?.icon || data.icon}
                            icon_svg={data.spec?.icon_svg || data.icon_svg}
                            className="h-8 w-8 relative z-10"
                            style={{ color }}
                        />
                    </div>

                    {/* Top Handle for Agent Connection - Outside the clipped circle but relative to its bounds */}
                    <NodeHandle
                        type="source"
                        position={Position.Top}
                        handleId={definition?.outputs?.[0]?.name || 'output'}
                        isConnectable={isConnectable}
                        color={color}
                        style={{ top: '-8px', zIndex: 100 }}
                    />
                </div>

                <div className="flex flex-col items-center px-1 max-w-[100px]">
                    <span className="text-[11px] font-bold text-foreground text-center line-clamp-1 group-hover:text-primary transition-colors">
                        {displayName}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono opacity-50">
                        {subtitle}
                    </span>
                </div>
            </div>
        </div>
    )
})

AIAuxiliaryNode.displayName = 'AIAuxiliaryNode'
