'use client'

import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useReactFlow, useEdges } from 'reactflow'

interface QuickAddButtonProps {
    nodeId: string
    handleId?: string
    position?: 'right' | 'left' | 'top' | 'bottom'
    color?: string
    style?: React.CSSProperties
    connectionType?: 'source' | 'target'
    filterType?: string
}

export function QuickAddButton({
    nodeId,
    handleId,
    position = 'right',
    color = '#3b82f6',
    style,
    connectionType = 'source',
    filterType
}: QuickAddButtonProps) {
    const { getNode } = useReactFlow()
    const edges = useEdges()

    // Check connection status based on direction
    const isConnected = edges.some(edge => {
        if (connectionType === 'source') {
            // Outgoing: source == nodeId
            if (edge.source !== nodeId) return false
            const edgeHandle = (edge.sourceHandle || (edge as any).source_handle)
            const targetHandleId = handleId?.toString().toLowerCase()

            if (handleId) {
                if (edgeHandle?.toString().toLowerCase() === targetHandleId) return true
                if (!edgeHandle && (handleId === 'true' || handleId === 'output' || handleId === 'default')) return true
                return false
            }
            return true
        } else {
            // Incoming: target == nodeId
            if (edge.target !== nodeId) return false
            const edgeHandle = (edge.targetHandle || (edge as any).target_handle)
            const targetHandleId = handleId?.toString().toLowerCase()

            if (handleId) {
                if (edgeHandle?.toString().toLowerCase() === targetHandleId) return true
                return false
            }
            return true
        }
    })

    // Only show if not connected
    if (isConnected) return null

    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        const node = getNode(nodeId)
        if (!node) return

        const offsetX = position === 'right' ? (node.width || 100) + 40 : 0
        const offsetY = position === 'bottom' ? (node.height || 80) + 40 : 0
        // Simple heuristic for new node position, can be refined

        // Dispatch event
        const event = new CustomEvent('addNodeAfter', {
            detail: {
                source: connectionType === 'source' ? nodeId : undefined,
                handleId: connectionType === 'source' ? handleId : undefined,
                target: connectionType === 'target' ? nodeId : undefined,
                targetHandle: connectionType === 'target' ? handleId : undefined,
                x: node.position.x + offsetX,
                y: node.position.y + offsetY,
                filterType
            }
        })
        window.dispatchEvent(event)
    }

    const isBottom = position === 'bottom'

    // Style configuration based on position
    const wrapperStyle: React.CSSProperties = isBottom ? {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '0px', // Anchor vertical line
        ...style
    } : {
        top: style?.top || '50%',
        left: '100%',
        transform: 'translateY(-50%)',
        height: '0px',
        ...style
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute z-10 flex items-center justify-center pointer-events-none group/add ${isBottom ? 'flex-col' : ''}`}
            style={wrapperStyle}
        >
            {/* Connection Line */}
            <div
                className={`transition-all duration-300 opacity-30 group-hover/node:opacity-60 ${isBottom ? 'w-[2px] h-10' : 'h-[2px] w-10'}`}
                style={{
                    background: `linear-gradient(to ${isBottom ? 'bottom' : 'right'}, ${color} 0%, ${color} 60%, transparent 100%)`
                }}
            />

            {/* Plus Button */}
            <motion.button
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddClick}
                className={`flex items-center justify-center w-6 h-6 rounded-full bg-card/95 backdrop-blur-xl border-2 border-border shadow-xl cursor-pointer pointer-events-auto transition-all group/plus active:shadow-inner ${isBottom ? '-mt-2' : '-ml-2'}`}
                style={{ borderColor: `${color}40` }}
            >
                <Plus
                    className="h-3.5 w-3.5 text-muted-foreground group-hover/plus:text-primary transition-colors"
                />
            </motion.button>
        </motion.div>
    )
}
