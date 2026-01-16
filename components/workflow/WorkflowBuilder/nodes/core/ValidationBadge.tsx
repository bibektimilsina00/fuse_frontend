'use client'

/**
 * ValidationBadge Component
 * 
 * Shows a warning badge when node configuration is incomplete.
 * Displays tooltip with list of missing items on hover.
 */

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export interface ValidationWarning {
    type: string
    field: string
    message: string
    severity: 'warning' | 'error'
}

interface ValidationBadgeProps {
    warnings: ValidationWarning[]
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    size?: 'sm' | 'md'
}

export const ValidationBadge = memo(({
    warnings,
    position = 'top-right',
    size = 'md'
}: ValidationBadgeProps) => {
    const [showTooltip, setShowTooltip] = useState(false)

    if (warnings.length === 0) return null

    const positionClasses = {
        'top-right': 'absolute -top-2 -right-2',
        'top-left': 'absolute -top-2 -left-2',
        'bottom-right': 'absolute -bottom-2 -right-2',
        'bottom-left': 'absolute -bottom-2 -left-2'
    }

    const sizeClasses = {
        sm: 'p-0.5',
        md: 'p-1'
    }

    const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'

    return (
        <div
            className={`${positionClasses[position]} z-20`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className="relative">
                {/* Badge */}
                <div className={`bg-amber-500 text-white ${sizeClasses[size]} rounded-full shadow-lg cursor-help animate-pulse`}>
                    <AlertTriangle className={iconSize} />
                </div>

                {/* Tooltip */}
                <AnimatePresence>
                    {showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
                        >
                            <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[160px] max-w-[220px]">
                                <div className="font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
                                    <AlertTriangle className="h-3 w-3" />
                                    Configuration Needed
                                </div>
                                <ul className="space-y-1 text-slate-300">
                                    {warnings.map((w, i) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                            <span className="text-amber-400 mt-0.5">•</span>
                                            <span>{w.message}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Arrow */}
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
})

ValidationBadge.displayName = 'ValidationBadge'
