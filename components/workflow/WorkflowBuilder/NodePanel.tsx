'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search, ChevronRight, Zap, Globe, Clock, MessageSquare, Terminal, Webhook, FileText, MousePointerClick, LayoutGrid, ArrowLeft, Bot, GitBranch, Database, Cpu, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { memo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconRenderer } from './utils/iconMap'
import { NodeTypeDefinition } from '@/types'
import { cn } from '@/lib/utils'

interface NodePanelProps {
    isOpen: boolean
    onClose: () => void
    searchQuery: string
    setSearchQuery: (query: string) => void
    availableNodeTypes: NodeTypeDefinition[]
    onAddNode: (nodeType: NodeTypeDefinition) => void
    isWorkflowEmpty?: boolean
    filterType?: 'trigger' | 'action' | 'ai_tool' | 'ai_memory' | 'ai_chat_model'
}

type PanelView = 'main' | 'app_triggers' | 'actions' | 'ai' | 'utilities' | 'logic'

export const NodePanel = memo(({
    isOpen,
    onClose,
    searchQuery,
    setSearchQuery,
    availableNodeTypes,
    onAddNode,
    isWorkflowEmpty = false,
    filterType
}: NodePanelProps) => {
    const [mounted, setMounted] = useState(false)
    const [view, setView] = useState<PanelView>('main')

    useEffect(() => {
        setMounted(true)
    }, [])

    // Reset view when opening
    useEffect(() => {
        if (isOpen) {
            setView('main')
        }
    }, [isOpen])

    if (!mounted) return null

    const getFilteredNodes = () => {
        const nodes = availableNodeTypes || []

        // 1. If searching, return everything that matches
        if (searchQuery) {
            return nodes.filter(n =>
                (n.label || (n as any).displayName)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (n.name || n.id)?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // 2. Specialized Filtering (e.g. from Agent + button)
        if (filterType) {
            switch (filterType) {
                case 'ai_tool': return nodes.filter(n => n.category?.toUpperCase() === 'AI_TOOL')
                case 'ai_memory': return nodes.filter(n => n.category?.toUpperCase() === 'AI_MEMORY')
                case 'ai_chat_model': return nodes.filter(n => n.category?.toUpperCase() === 'AI_CHAT_MODEL')
                case 'trigger': return nodes.filter(n => n.type === 'trigger')
                case 'action': return nodes.filter(n => n.type === 'action')
                default: return nodes
            }
        }

        // 3. Workflow Empty - show triggers only
        if (isWorkflowEmpty) {
            if (view === 'app_triggers') {
                return nodes.filter(n => n.type === 'trigger' && n.service !== 'core' && !['manual.trigger', 'schedule.cron', 'webhook.receive'].includes(n.name || n.id))
            }
            return []
        }

        // 4. Regular Categorized Views
        switch (view) {
            case 'ai':
                return nodes.filter(n => ['AI', 'AI_TOOL', 'AI_MEMORY', 'AI_CHAT_MODEL'].includes(n.category?.toUpperCase()))
            case 'actions':
                return nodes.filter(n => n.type === 'action' && n.category === 'ACTION' && n.service !== 'core')
            case 'utilities':
                return nodes.filter(n => ['UTILITY', 'DATA'].includes(n.category?.toUpperCase()))
            case 'logic':
                return nodes.filter(n => ['LOGIC', 'FLOW'].includes(n.category?.toUpperCase()))
            default:
                return []
        }
    }

    const filteredNodes = getFilteredNodes()
    const isShowingList = searchQuery || view !== 'main' || filterType

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 450, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 450, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed right-0 top-0 bottom-0 w-[450px] bg-card border-l border-border shadow-2xl z-[100] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {view !== 'main' && !filterType && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView('main')}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                )}
                                <h3 className="text-xl font-bold tracking-tight">
                                    {filterType ? `Select ${filterType.replace('ai_', '').replace('_', ' ')}` :
                                        isWorkflowEmpty ? 'How does it start?' : 'Add a step'}
                                </h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search all nodes..."
                                className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {isShowingList ? (
                            <div className="grid grid-cols-3 gap-3">
                                {filteredNodes.map(node => (
                                    <button
                                        key={node.name}
                                        onClick={() => {
                                            onAddNode(node)
                                            onClose()
                                        }}
                                        title={node.description}
                                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-center group gap-3 aspect-square min-h-[120px]"
                                    >
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all p-2.5 overflow-hidden">
                                            <IconRenderer
                                                icon={node.icon}
                                                icon_svg={node.icon_svg}
                                                className="h-full w-full text-primary"
                                                fallback={node.type === 'trigger' ? Zap : Settings}
                                            />
                                        </div>
                                        <div className="font-semibold text-foreground tracking-tight text-[11px] leading-tight break-words line-clamp-2 px-1">
                                            {node.label}
                                        </div>
                                    </button>
                                ))}
                                {filteredNodes.length === 0 && (
                                    <div className="col-span-3 text-center py-12">
                                        <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                                            <Search className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">No nodes found.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {isWorkflowEmpty ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <CategoryButton
                                            icon={MousePointerClick}
                                            title="Manual"
                                            onClick={() => {
                                                const n = availableNodeTypes.find(v => (v.name || v.id) === 'manual.trigger')
                                                if (n) { onAddNode(n); onClose(); }
                                            }}
                                            isTall
                                        />
                                        <CategoryButton
                                            icon={LayoutGrid}
                                            title="App Events"
                                            onClick={() => setView('app_triggers')}
                                            hasChevron
                                            isTall
                                        />
                                        <CategoryButton
                                            icon={Clock}
                                            title="Schedule"
                                            onClick={() => {
                                                const n = availableNodeTypes.find(v => (v.name || v.id) === 'schedule.cron')
                                                if (n) { onAddNode(n); onClose(); }
                                            }}
                                            isTall
                                        />
                                        <CategoryButton
                                            icon={Webhook}
                                            title="Webhook"
                                            onClick={() => {
                                                const n = availableNodeTypes.find(v => (v.name || v.id) === 'webhook.receive')
                                                if (n) { onAddNode(n); onClose(); }
                                            }}
                                            isTall
                                        />
                                        <CategoryButton
                                            icon={FileText}
                                            title="Forms"
                                            onClick={() => {
                                                const n = availableNodeTypes.find(v => (v.name || v.id) === 'form.trigger')
                                                if (n) { onAddNode(n); onClose(); }
                                            }}
                                            isTall
                                        />
                                        <CategoryButton
                                            icon={Database}
                                            title="Data Tables"
                                            onClick={() => {
                                                const n = availableNodeTypes.find(v => (v.name || v.id) === 'core.data_table.trigger')
                                                if (n) { onAddNode(n); onClose(); }
                                            }}
                                            isTall
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        <CategoryButton
                                            icon={Bot}
                                            title="AI"
                                            onClick={() => setView('ai')}
                                            hasChevron
                                        />
                                        <CategoryButton
                                            icon={Globe}
                                            title="Integrations"
                                            onClick={() => setView('actions')}
                                            hasChevron
                                        />
                                        <CategoryButton
                                            icon={Terminal}
                                            title="Utilities"
                                            onClick={() => setView('utilities')}
                                            hasChevron
                                        />
                                        <CategoryButton
                                            icon={GitBranch}
                                            title="Logic"
                                            onClick={() => setView('logic')}
                                            hasChevron
                                        />
                                        <div className="pt-4 mt-4 border-t border-border">
                                            <CategoryButton
                                                icon={Zap}
                                                title="Triggers"
                                                onClick={() => setSearchQuery('trigger')}
                                                hasChevron
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    )
})

interface CategoryButtonProps {
    icon: any
    title: string
    onClick: () => void
    hasChevron?: boolean
    isTall?: boolean
}

const CategoryButton = ({ icon: Icon, title, onClick, hasChevron, isTall }: CategoryButtonProps) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left group w-full",
            isTall && "flex-col justify-center items-center text-center gap-3 h-32"
        )}
    >
        <div className={cn(
            "rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all",
            isTall ? "h-12 w-12 p-2.5" : "h-10 w-10 p-2"
        )}>
            <Icon className={cn("text-primary", isTall ? "h-6 w-6" : "h-5 w-5")} />
        </div>
        <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground tracking-tight">{title}</span>
                {hasChevron && !isTall && <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />}
            </div>
        </div>
    </button>
)

NodePanel.displayName = 'NodePanel'
