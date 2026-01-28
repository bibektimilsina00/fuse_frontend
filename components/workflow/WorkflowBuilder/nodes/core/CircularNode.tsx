'use client'

import { memo, useState } from 'react'
import { Position, NodeProps, NodeToolbar } from 'reactflow'
import { cn } from '@/lib/utils'
import { IconRenderer } from '../../utils/iconMap'
import { NodeHandle, StatusIndicator, RunningBorder } from './'

export const CircularNode = memo(({ data, selected, isConnectable, id }: NodeProps) => {
    const [showToolbar, setShowToolbar] = useState(false)
    const isRunning = data.status === 'running'
    const color = data.color || '#8b5cf6'

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowToolbar(true)}
            onMouseLeave={() => setShowToolbar(false)}
        >
            <NodeToolbar
                isVisible={showToolbar}
                position={Position.Top}
                className="flex items-center gap-2 bg-card border border-border p-1 rounded-lg shadow-lg"
            >
                <button className="p-1 hover:bg-muted rounded text-destructive" onClick={() => data.onDelete?.(id)}>
                    <X className="h-4 w-4" />
                </button>
            </NodeToolbar>

            <div className="flex flex-col items-center gap-2 group">
                <div
                    className={cn(
                        "relative w-16 h-16 rounded-full bg-card/90 backdrop-blur-xl border-2 flex items-center justify-center transition-all duration-300 shadow-xl",
                        selected ? "border-primary ring-4 ring-primary/20 scale-110" : "border-border hover:border-border-strong hover:scale-105",
                        isRunning && "border-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    )}
                >
                    <RunningBorder color={color} isRunning={isRunning} borderRadius="100%" />

                    <div className="absolute inset-0 rounded-full opacity-[0.1]" style={{ backgroundColor: color }} />

                    <IconRenderer
                        icon={data.spec?.icon || data.icon}
                        icon_svg={data.spec?.icon_svg || data.icon_svg}
                        className="h-8 w-8 relative z-10"
                        style={{ color }}
                    />
                </div>

                {/* label below */}
                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest opacity-70 text-center max-w-[80px] line-clamp-1">
                    {data.label || 'Node'}
                </span>

                {/* Auxiliary Handle (Right side for one-way connection to Agent) */}
                <NodeHandle
                    type="source"
                    position={Position.Right}
                    handleId="auxiliary"
                    isConnectable={isConnectable}
                    color={color}
                    style={{ right: '0px' }}
                />
            </div>
        </div>
    )
})

CircularNode.displayName = 'CircularNode'
import { X } from 'lucide-react'
