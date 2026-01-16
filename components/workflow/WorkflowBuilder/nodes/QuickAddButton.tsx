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
}

export function QuickAddButton({
    nodeId,
    handleId,
    position = 'right',
    color = '#3b82f6',
    style
}: QuickAddButtonProps) {
    const { getNode } = useReactFlow()
    const edges = useEdges()

    // Check if this handle has any outgoing connections
    const isConnected = edges.some(edge => {
        const sourceMatch = edge.source === nodeId
        if (!sourceMatch) return false

        // Get the specific handle ID for this edge (robustly checking multiple potential fields)
        const edgeHandle = (edge.sourceHandle || (edge as any).source_handle || (edge as any).condition)
        const targetHandleId = handleId?.toString().toLowerCase()

        if (handleId) {
            // Case 1: Edge explicitly matches this handle
            if (edgeHandle?.toString().toLowerCase() === targetHandleId) return true

            // Case 2: Edge has NO handle ID (default connection)
            // If it's a default connection, we'll consider the 'true' or 'default' handle occupied
            const isFirstOrOnlyHandle = handleId === 'true' || handleId === 'output' || handleId === 'default'
            if (!edgeHandle && isFirstOrOnlyHandle) return true

            return false
        } else {
            // For single output nodes (no handleId provided), any connection counts
            return true
        }
    })

    // Only show if not connected
    if (isConnected) return null

    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        const node = getNode(nodeId)
        if (!node) return

        // Dispatch custom event to open node panel
        const event = new CustomEvent('addNodeAfter', {
            detail: {
                source: nodeId,
                handleId,
                x: node.position.x + (node.width || 100) + 40,
                y: node.position.y + (node.height || 80) / 2
            }
        })
        window.dispatchEvent(event)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-10 flex items-center pointer-events-none group/add"
            style={{
                top: style?.top || '50%',
                left: '100%', // Start exactly from the center of the dot
                transform: 'translateY(-50%)',
                height: '0px', // Anchor at a single line point for perfect vertical centering
                ...style
            }}
        >
            {/* Connection Line - starting from the handle dot center */}
            <div
                className="h-[2px] w-10 opacity-30 group-hover/node:opacity-60 transition-all duration-300"
                style={{
                    background: `linear-gradient(to right, ${color} 0%, ${color} 60%, transparent 100%)`
                }}
            />

            {/* Plus Button with Glassmorphism */}
            <motion.button
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddClick}
                className="flex items-center justify-center w-6 h-6 rounded-full bg-card/95 backdrop-blur-xl border-2 border-border shadow-xl cursor-pointer pointer-events-auto transition-all group/plus active:shadow-inner -ml-2"
                style={{ borderColor: `${color}40` }}
            >
                <Plus
                    className="h-3.5 w-3.5 text-muted-foreground group-hover/plus:text-primary transition-colors"
                />
            </motion.button>
        </motion.div>
    )
}
