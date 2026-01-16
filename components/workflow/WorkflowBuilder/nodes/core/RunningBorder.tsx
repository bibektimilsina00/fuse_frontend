'use client'

/**
 * RunningBorder Component
 * 
 * Animated conic gradient border that shows when a node is running.
 */

import { memo } from 'react'
import { motion } from 'framer-motion'

interface RunningBorderProps {
    color: string
    borderRadius?: string
    isRunning: boolean
}

export const RunningBorder = memo(({
    color,
    borderRadius = '14px',
    isRunning
}: RunningBorderProps) => {
    if (!isRunning) return null

    return (
        <div
            className="absolute inset-[-2px] overflow-hidden z-0 pointer-events-none"
            style={{ borderRadius }}
        >
            <motion.div
                className="absolute inset-[-250%]"
                animate={{ rotate: [0, 360] }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    background: `conic-gradient(from 0deg, transparent 0deg, ${color} 15deg, transparent 30deg, ${color} 180deg, transparent 195deg)`,
                }}
            />
        </div>
    )
})

RunningBorder.displayName = 'RunningBorder'
