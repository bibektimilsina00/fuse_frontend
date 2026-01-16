'use client'

/**
 * NodeNotes Component
 * 
 * Displays notes attached to a node when "Display Note in Flow" is enabled.
 */

import { memo } from 'react'
import { FileText } from 'lucide-react'

interface NodeNotesProps {
    notes?: string
    displayInFlow?: boolean
    maxWidth?: string
    marginTop?: string
}

export const NodeNotes = memo(({
    notes,
    displayInFlow = false,
    maxWidth = '200px',
    marginTop = 'mt-3'
}: NodeNotesProps) => {
    if (!displayInFlow || !notes) return null

    return (
        <div className={`absolute top-full ${marginTop} left-1/2 -translate-x-1/2 w-full min-w-[120px] z-0`} style={{ maxWidth }}>
            <div className="bg-amber-50/50 dark:bg-amber-900/20 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/30 rounded-lg p-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="flex items-start gap-1.5">
                    <FileText className="w-2.5 h-2.5 text-amber-500/50 mt-0.5 shrink-0" />
                    <p className="text-[9px] text-amber-900/70 dark:text-amber-100/50 font-medium leading-relaxed italic line-clamp-3">
                        {notes}
                    </p>
                </div>
            </div>
        </div>
    )
})

NodeNotes.displayName = 'NodeNotes'
