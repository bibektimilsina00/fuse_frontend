'use client'

/**
 * NodeHandle Component
 * 
 * A reusable animated handle for node connections.
 * Supports both input (target) and output (source) handles.
 */

import { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { motion } from 'framer-motion'

interface NodeHandleProps {
    type: 'source' | 'target'
    position: Position
    isConnectable?: boolean
    color?: string
    handleId?: string
    style?: React.CSSProperties
}

export const NodeHandle = memo(({
    type,
    position,
    isConnectable = true,
    color = '#9ca3af',
    handleId,
    style
}: NodeHandleProps) => {
    const [isHovering, setIsHovering] = useState(false)

    // Default positioning based on position
    const defaultStyle: React.CSSProperties = {
        ...(position === Position.Left && { left: '-8px', top: '50%', transform: 'translateY(-50%)' }),
        ...(position === Position.Right && { right: '-8px', top: '50%', transform: 'translateY(-50%)' }),
        ...(position === Position.Top && { top: '-8px', left: '50%', transform: 'translateX(-50%)' }),
        ...(position === Position.Bottom && { bottom: '-8px', left: '50%', transform: 'translateX(-50%)' }),
        ...style
    }

    return (
        <Handle
            type={type}
            position={position}
            id={handleId}
            isConnectable={isConnectable}
            className="!w-4 !h-4 !bg-transparent !border-none z-50 p-0"
            style={defaultStyle}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <motion.div
                className="w-full h-full relative flex items-center justify-center pointer-events-none"
                animate={isHovering ? 'hover' : 'initial'}
                initial="initial"
            >
                {/* Animated Pulse Ring on Hover */}
                <motion.div
                    variants={{
                        initial: { scale: 1, opacity: 0 },
                        hover: { scale: 2, opacity: 0.4, transition: { repeat: Infinity, duration: 1 } }
                    }}
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: color }}
                />

                {/* Main Connection Dot */}
                <motion.div
                    variants={{
                        initial: { scale: 1 },
                        hover: { scale: 1.25 }
                    }}
                    className="w-full h-full rounded-full border-2 border-white dark:border-slate-700 shadow-md relative z-10"
                    style={{ backgroundColor: color }}
                >
                    {/* Subtle Inner Highlight */}
                    <div className="absolute top-0.5 left-0.5 w-[30%] h-[30%] bg-white rounded-full opacity-40" />
                </motion.div>
            </motion.div>
        </Handle>
    )
})

NodeHandle.displayName = 'NodeHandle'
