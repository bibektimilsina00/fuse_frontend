'use client'

import { useState } from 'react'
import { Bug, FileJson, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebugWorkflows, useLoadDebugWorkflow } from '@/services/queries/workflows'
import type { WorkflowV2 } from '@/types/workflow'

interface DebugMenuProps {
    onLoadWorkflow: (workflow: WorkflowV2) => void
}

export function DebugMenu({ onLoadWorkflow }: DebugMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    // React Query hooks
    const { data: workflows = [], isLoading: isLoadingList } = useDebugWorkflows()
    const loadWorkflowMutation = useLoadDebugWorkflow()

    const handleLoadWorkflow = (filename: string) => {
        loadWorkflowMutation.mutate(filename, {
            onSuccess: (data) => {
                onLoadWorkflow(data)
                setIsOpen(false)
            },
        })
    }

    const isLoading = isLoadingList || loadWorkflowMutation.isPending

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-all hover:scale-110 active:scale-95 group ${isOpen ? 'bg-amber-100 text-amber-600 ring-1 ring-amber-200' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                title="Debug Workflows"
            >
                <Bug className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-12 scale-110' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.95 }}
                        className="absolute top-0 left-12 w-72 bg-card/98 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 origin-left"
                    >
                        <div className="p-3 border-b border-border bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <FileJson className="h-3 w-3" />
                                Dummy Workflows ({workflows.length})
                            </h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto p-1">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                </div>
                            ) : workflows.length > 0 ? (
                                workflows.map((wf) => (
                                    <button
                                        key={wf}
                                        onClick={() => handleLoadWorkflow(wf)}
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between group"
                                    >
                                        <span className="truncate pr-2">{wf.replace('.json', '')}</span>
                                        <span className="text-[9px] opacity-0 group-hover:opacity-100 bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold transition-opacity">Load</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-muted-foreground italic">
                                    No dummy workflows found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
