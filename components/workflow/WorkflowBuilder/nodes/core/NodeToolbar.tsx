'use client'

/**
 * NodeToolbar Component
 * 
 * A floating toolbar that appears on hover.
 * Contains common actions: execute, pause, delete.
 */

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Play, PauseCircle, Loader2 } from 'lucide-react'

interface NodeToolbarProps {
    show: boolean
    isRunning?: boolean
    isPending?: boolean
    isPaused?: boolean
    onExecute?: () => void
    onTogglePause?: () => void
    onDelete?: () => void
    position?: 'top' | 'bottom'
}

export const NodeToolbar = memo(({
    show,
    isRunning = false,
    isPending = false,
    isPaused = false,
    onExecute,
    onTogglePause,
    onDelete,
    position = 'top'
}: NodeToolbarProps) => {
    const positionClasses = position === 'top'
        ? 'absolute -top-12 left-1/2 -translate-x-1/2'
        : 'absolute -bottom-12 left-1/2 -translate-x-1/2'

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 5 : -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: position === 'top' ? 5 : -5 }}
                    className={`${positionClasses} flex items-center gap-1 p-1 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-xl z-50 min-w-max`}
                >
                    {/* Execute Button */}
                    {onExecute && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onExecute(); }}
                            disabled={isRunning || isPending}
                            className="p-1.5 hover:bg-emerald-500/10 rounded-md transition-all group disabled:opacity-50"
                            title={isRunning ? "Running..." : "Run this node"}
                        >
                            {isRunning || isPending ? (
                                <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
                            ) : (
                                <Play className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-500 group-hover:fill-emerald-500" />
                            )}
                        </button>
                    )}

                    {/* Pause Toggle */}
                    {onTogglePause && (
                        <>
                            <div className="w-[1px] h-4 bg-border/50" />
                            <button
                                onClick={(e) => { e.stopPropagation(); onTogglePause(); }}
                                className={`p-1.5 rounded-md transition-all group ${isPaused ? 'hover:bg-emerald-500/10' : 'hover:bg-amber-500/10'
                                    }`}
                                title={isPaused ? 'Activate' : 'Deactivate'}
                            >
                                {isPaused ? (
                                    <Play className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-500 group-hover:fill-emerald-500" />
                                ) : (
                                    <PauseCircle className="h-3.5 w-3.5 text-muted-foreground group-hover:text-amber-500" />
                                )}
                            </button>
                        </>
                    )}

                    {/* Delete Button */}
                    {onDelete && (
                        <>
                            <div className="w-[1px] h-4 bg-border/50" />
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="p-1.5 hover:bg-destructive/10 rounded-md transition-all group"
                                title="Delete"
                            >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive" />
                            </button>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
})

NodeToolbar.displayName = 'NodeToolbar'
