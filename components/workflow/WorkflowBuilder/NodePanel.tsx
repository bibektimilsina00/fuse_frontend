'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search, ChevronRight, Zap, Globe, Clock, MessageSquare, Terminal, Webhook, FileText, MousePointerClick, LayoutGrid, ArrowLeft, Bot, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { memo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getNodeIcon } from './utils/iconMap'
import { NodeTypeDefinition } from '@/types'

interface NodePanelProps {
    isOpen: boolean
    onClose: () => void
    searchQuery: string
    setSearchQuery: (query: string) => void
    availableNodeTypes: NodeTypeDefinition[]
    onAddNode: (nodeType: NodeTypeDefinition) => void
    isWorkflowEmpty?: boolean
}

const TRIGGER_GROUPS = [
    {
        id: 'manual',
        label: 'Trigger manually',
        description: 'Runs the flow on clicking a button. Good for testing.',
        icon: MousePointerClick,
        nodeType: 'manual.trigger'
    },
    {
        id: 'apps',
        label: 'On app event',
        description: 'Runs the flow when something happens in an app like WhatsApp, Email, etc.',
        icon: LayoutGrid,
        hasChildren: true
    },
    {
        id: 'schedule',
        label: 'On a schedule',
        description: 'Runs the flow every day, hour, or custom interval',
        icon: Clock,
        nodeType: 'schedule.cron'
    },
    {
        id: 'webhook',
        label: 'On webhook call',
        description: 'Runs the flow on receiving an HTTP request',
        icon: Webhook,
        nodeType: 'webhook.receive'
    },
    {
        id: 'form',
        label: 'On form submission',
        description: 'Runs on form submissions',
        icon: FileText,
        nodeType: 'form.submit'
    }
]

const ACTION_GROUPS = [
    {
        id: 'ai',
        label: 'AI',
        description: 'Build autonomous agents, summarize or search documents, etc.',
        icon: Bot
    },
    {
        id: 'app_action',
        label: 'Action in an app',
        description: 'Do something in an app or service like Google Sheets, Telegram or Notion',
        icon: Globe
    },
    {
        id: 'transformation',
        label: 'Data transformation',
        description: 'Manipulate, filter or convert data',
        icon: FileText
    },
    {
        id: 'flow',
        label: 'Flow',
        description: 'Branch, merge or loop the flow, etc.',
        icon: GitBranch
    },
    {
        id: 'core',
        label: 'Core',
        description: 'Run code, make HTTP requests, set webhooks, etc.',
        icon: Terminal
    },
    {
        id: 'trigger',
        label: 'Add another trigger',
        description: 'Triggers start your workflow. Workflows can have multiple triggers.',
        icon: Zap
    }
]

export const NodePanel = memo(({
    isOpen,
    onClose,
    searchQuery,
    setSearchQuery,
    availableNodeTypes,
    onAddNode,
    isWorkflowEmpty = false
}: NodePanelProps) => {
    const [mounted, setMounted] = useState(false)
    const [view, setView] = useState<string>('main')

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const getFilteredNodes = () => {
        // Workflow Empty - Trigger Filtering
        if (isWorkflowEmpty) {
            const triggers = (availableNodeTypes || []).filter(n => n.type === 'trigger');

            if (view === 'apps') {
                return triggers.filter(n => n.trigger_group === 'app');
            }

            if (view === 'other') {
                const definedGroups = ['manual', 'schedule', 'webhook', 'form', 'app'];
                return triggers.filter(n =>
                    !n.trigger_group ||
                    n.trigger_group === 'other' ||
                    !definedGroups.includes(n.trigger_group)
                );
            }
        }

        // Non-Empty Workflow - Action Filtering
        if (!isWorkflowEmpty) {
            const allNodes = availableNodeTypes || [];

            switch (view) {
                case 'ai':
                    return allNodes.filter(n => n.name.startsWith('ai.') || n.type === 'ai');
                case 'transformation':
                    return allNodes.filter(n => n.name.startsWith('data.'));
                case 'flow':
                    return allNodes.filter(n => n.type === 'logic' || n.name.startsWith('condition.') || n.name.startsWith('execution.'));
                case 'core':
                    return allNodes.filter(n => ['code.python', 'code.javascript', 'http.request'].includes(n.name));
                case 'trigger':
                    return allNodes.filter(n => n.type === 'trigger');
                case 'app_action':
                    // Filter action nodes that are not in the other categories
                    return allNodes.filter(n =>
                        n.type === 'action' &&
                        !n.name.startsWith('ai.') &&
                        !n.name.startsWith('data.') &&
                        !['code.python', 'code.javascript', 'http.request'].includes(n.name)
                    );
            }
        }

        return [];
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile or if needed, though usually sidebar is non-modal */}
                    {/* <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    /> */}

                    <motion.div
                        initial={{ x: isWorkflowEmpty ? 500 : 450, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: isWorkflowEmpty ? 500 : 450, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                        className={`fixed right-0 top-0 bottom-0 ${isWorkflowEmpty ? 'w-[500px]' : 'w-[450px]'} bg-card border-l border-border shadow-2xl overflow-hidden flex flex-col z-[100]`}
                    >
                        <div className="p-5 border-b border-border bg-muted/20">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg tracking-tight">
                                        {isWorkflowEmpty
                                            ? (view === 'main' ? 'What triggers this workflow?' : view === 'apps' ? 'App Triggers' : 'Other Triggers')
                                            : (view === 'main' ? 'What happens next?' : ACTION_GROUPS.find(g => g.id === view)?.label || 'Select Node')
                                        }
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1 leading-normal">
                                        {isWorkflowEmpty
                                            ? 'A trigger is a step that starts your workflow'
                                            : 'Select a step to add to your flow'}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="rounded-lg hover:bg-destructive/10 hover:text-destructive -mr-2 -mt-2"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={isWorkflowEmpty ? "Search triggers..." : "Search nodes..."}
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-4 space-y-6">
                                {/* ========================================================= */}
                                {/* EMPTY STATE RENDER LOGIC */}
                                {/* ========================================================= */}
                                {isWorkflowEmpty ? (
                                    <div className="space-y-4">
                                        {view === 'main' ? (
                                            <>
                                                {TRIGGER_GROUPS.map((group) => (
                                                    <button
                                                        key={group.id}
                                                        className="w-full flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
                                                        onClick={() => {
                                                            if (group.hasChildren) {
                                                                setView('apps')
                                                            } else if (group.nodeType) {
                                                                const node = availableNodeTypes.find(n => n.name === group.nodeType)
                                                                if (node) {
                                                                    onAddNode(node)
                                                                    setSearchQuery('')
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                            <group.icon className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 pt-0.5">
                                                            <div className="font-medium text-foreground flex items-center justify-between gap-2">
                                                                {group.label}
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                                                {group.description}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}

                                                {/* Other / Search Fallback */}
                                                <div className="pt-4 border-t border-border mt-4">
                                                    <button
                                                        onClick={() => setView('other')}
                                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left group text-muted-foreground hover:text-foreground"
                                                    >
                                                        <Terminal className="h-4 w-4 shrink-0" />
                                                        <div className="flex-1">
                                                            <span className="text-sm font-medium block">Other ways...</span>
                                                            <span className="text-xs opacity-70">Browse other triggers</span>
                                                        </div>
                                                        <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            /* Apps / Other Triggers View */
                                            <div className="space-y-4">
                                                <button
                                                    onClick={() => setView('main')}
                                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 px-1"
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                    Back to categories
                                                </button>

                                                {getFilteredNodes()
                                                    .filter(n =>
                                                        searchQuery === '' ||
                                                        n.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        n.description?.toLowerCase().includes(searchQuery.toLowerCase())
                                                    )
                                                    .map((nodeType) => (
                                                        <button
                                                            key={nodeType.name}
                                                            className="w-full flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
                                                            onClick={() => {
                                                                onAddNode(nodeType)
                                                                setSearchQuery('')
                                                            }}
                                                        >
                                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                                {(() => {
                                                                    const IconComponent = getNodeIcon(nodeType.name, nodeType.type)
                                                                    return <IconComponent className="h-5 w-5 text-primary" />
                                                                })()}
                                                            </div>
                                                            <div className="flex-1 min-w-0 pt-0.5">
                                                                <div className="font-medium text-foreground flex items-center justify-between gap-2">
                                                                    {nodeType.label}
                                                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                                                    {nodeType.description}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))}

                                                {getFilteredNodes().length === 0 && (
                                                    <div className="text-center py-12 text-muted-foreground">
                                                        <p>No triggers found in this category.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* ========================================================= */
                                    /* NORMAL / ACTION STATE RENDER LOGIC */
                                    /* ========================================================= */
                                    <div className="space-y-4">
                                        {view === 'main' ? (
                                            <>
                                                {ACTION_GROUPS.map((group) => (
                                                    <button
                                                        key={group.id}
                                                        className="w-full flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
                                                        onClick={() => setView(group.id)}
                                                    >
                                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                            <group.icon className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 pt-0.5">
                                                            <div className="font-medium text-foreground flex items-center justify-between gap-2">
                                                                {group.label}
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                                                {group.description}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </>
                                        ) : (
                                            /* Filtered Action View */
                                            <div className="space-y-4">
                                                <button
                                                    onClick={() => setView('main')}
                                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 px-1"
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                    Back to categories
                                                </button>

                                                {getFilteredNodes()
                                                    .filter(n =>
                                                        searchQuery === '' ||
                                                        n.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        n.description?.toLowerCase().includes(searchQuery.toLowerCase())
                                                    )
                                                    .map((nodeType) => (
                                                        <button
                                                            key={nodeType.name}
                                                            className="w-full flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
                                                            onClick={() => {
                                                                onAddNode(nodeType)
                                                                setSearchQuery('')
                                                            }}
                                                        >
                                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                                {(() => {
                                                                    const IconComponent = getNodeIcon(nodeType.name, nodeType.type)
                                                                    return <IconComponent className="h-5 w-5 text-primary" />
                                                                })()}
                                                            </div>
                                                            <div className="flex-1 min-w-0 pt-0.5">
                                                                <div className="font-medium text-foreground flex items-center justify-between gap-2">
                                                                    {nodeType.label}
                                                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                                                    {nodeType.description}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))}

                                                {getFilteredNodes().length === 0 && (
                                                    <div className="text-center py-12 text-muted-foreground">
                                                        <p>No nodes found in this category.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
})

NodePanel.displayName = 'NodePanel'
