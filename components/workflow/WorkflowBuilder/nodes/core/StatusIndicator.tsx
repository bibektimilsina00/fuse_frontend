'use client'

/**
 * StatusIndicator Component
 * 
 * Shows the current status of a node (running, success, failed).
 * Includes animated indicators for different states.
 */

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'

export type NodeStatus = 'idle' | 'pending' | 'running' | 'success' | 'failed' | 'warning'

interface StatusIndicatorProps {
    status: NodeStatus
    variant?: 'dot' | 'icon' | 'bar'
    size?: 'sm' | 'md'
    className?: string
}

export const StatusIndicator = memo(({
    status,
    variant = 'dot',
    size = 'sm',
    className = ''
}: StatusIndicatorProps) => {
    if (status === 'idle') return null

    const sizeClasses = {
        sm: { dot: 'h-2 w-2', icon: 'h-3 w-3' },
        md: { dot: 'h-3 w-3', icon: 'h-4 w-4' }
    }

    // Dot variant
    if (variant === 'dot') {
        if (status === 'running' || status === 'pending') {
            return (
                <span className={`relative flex ${sizeClasses[size].dot} ${className}`}>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-full w-full bg-primary" />
                </span>
            )
        }

        const colorClasses = {
            success: 'bg-emerald-500',
            failed: 'bg-destructive',
            warning: 'bg-amber-500',
            idle: 'bg-muted',
            pending: 'bg-primary',
            running: 'bg-primary'
        }

        return (
            <div className={`${sizeClasses[size].dot} rounded-full ${colorClasses[status]} shadow-sm ${className}`} />
        )
    }

    // Icon variant
    if (variant === 'icon') {
        if (status === 'running' || status === 'pending') {
            return <Loader2 className={`${sizeClasses[size].icon} animate-spin text-primary ${className}`} />
        }

        if (status === 'success') {
            return <Check className={`${sizeClasses[size].icon} text-emerald-500 ${className}`} />
        }

        if (status === 'failed') {
            return <X className={`${sizeClasses[size].icon} text-destructive ${className}`} />
        }

        return null
    }

    // Bar variant (bottom status bar)
    if (variant === 'bar') {
        const barColors = {
            success: 'bg-emerald-500',
            failed: 'bg-destructive',
            warning: 'bg-amber-500',
            running: 'bg-primary',
            pending: 'bg-primary',
            idle: 'bg-transparent'
        }

        return (
            <div className={`h-1 w-full ${barColors[status]} ${className}`} />
        )
    }

    return null
})

StatusIndicator.displayName = 'StatusIndicator'
