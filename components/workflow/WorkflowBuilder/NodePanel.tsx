'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { memo } from 'react'
import { getNodeIcon } from './utils/iconMap'
import { NodeTypeDefinition } from '@/types'

interface NodePanelProps {
    isOpen: boolean
    onClose: () => void
    searchQuery: string
    setSearchQuery: (query: string) => void
    availableNodeTypes: NodeTypeDefinition[]
    onAddNode: (nodeType: NodeTypeDefinition) => void
}

export const NodePanel = memo(({
    isOpen,
    onClose,
    searchQuery,
    setSearchQuery,
    availableNodeTypes,
    onAddNode
}: NodePanelProps) => {

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 320, opacity: 0 }}
                    className="absolute right-4 top-4 bottom-4 w-80 bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col z-20"
                >
                    <div className="p-4 bg-background/50 backdrop-blur-md border-b border-border flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg">Add Node</h3>
                            <p className="text-xs text-muted-foreground">Select a step to add to your flow</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full shadow-sm hover:bg-background/80 transition-all"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="p-4 border-b border-border bg-background/20">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search tools & triggers..."
                                    className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                            {['Trigger', 'Action', 'Logic', 'Transform'].map((category) => {
                                const categoryNodes = (availableNodeTypes || [])
                                    .filter((n) => {
                                        const isRequestedCategory = (n.category === category ||
                                            (category === 'Action' && n.type === 'action') ||
                                            (category === 'Trigger' && n.type === 'trigger'));

                                        if (!isRequestedCategory) return false;

                                        // Filter out specific triggers as requested
                                        if (category === 'Trigger') {
                                            return n.name === 'schedule.cron';
                                        }

                                        return (searchQuery === '' ||
                                            n.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            n.description?.toLowerCase().includes(searchQuery.toLowerCase()));
                                    })

                                if (categoryNodes.length === 0) return null

                                return (
                                    <div key={category} className="space-y-4">
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                                                {category}
                                            </span>
                                            <div className="h-[1px] flex-1 bg-border/40" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-2.5">
                                            {categoryNodes.map((nodeType) => (
                                                <button
                                                    key={nodeType.name}
                                                    className="flex items-center gap-4 p-3.5 rounded-2xl bg-background/40 border border-border/40 hover:border-primary/40 hover:bg-background/80 hover:shadow-lg transition-all text-left group relative overflow-hidden"
                                                    onClick={() => {
                                                        onAddNode(nodeType)
                                                        setSearchQuery('')
                                                    }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    <div className={`
                                                        relative z-10 p-2.5 rounded-xl transition-all shadow-sm group-hover:scale-110 group-hover:shadow-md
                                                        ${nodeType.type === 'trigger'
                                                            ? 'bg-rose-500/10 text-rose-500'
                                                            : 'bg-indigo-500/10 text-indigo-500'
                                                        }
                                                    `}>
                                                        {(() => {
                                                            const IconComponent = getNodeIcon(nodeType.name, nodeType.type)
                                                            return <IconComponent className="h-5 w-5" />
                                                        })()}
                                                    </div>

                                                    <div className="relative z-10 flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                                                            {nodeType.label}
                                                            <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                                                        </div>
                                                        <div className="text-xs text-muted-foreground line-clamp-1 group-hover:text-muted-foreground/80 transition-colors">
                                                            {nodeType.description}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
})

NodePanel.displayName = 'NodePanel'
