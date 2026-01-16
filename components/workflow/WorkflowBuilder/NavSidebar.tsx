'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Home, Layout, Settings, X as CloseIcon } from 'lucide-react'
import { memo } from 'react'

interface NavSidebarProps {
    isOpen: boolean
    onClose: () => void
}

export const NavSidebar = memo(({ isOpen, onClose }: NavSidebarProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 flex flex-col"
                    >
                        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Zap className="h-5 w-5 text-primary-foreground fill-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-base leading-none tracking-tight">Antigravity</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-1">Workspace</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-accent rounded-lg transition-all text-muted-foreground hover:text-foreground"
                            >
                                <CloseIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <nav className="flex-1 p-3 space-y-1.5">
                            <a
                                href="/dashboard"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all group"
                            >
                                <Home className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
                                <span>Dashboard</span>
                            </a>
                            <a
                                href="/workflows"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary/10 to-transparent text-primary transition-all border border-primary/10 shadow-sm"
                            >
                                <Layout className="h-4 w-4" />
                                <span>Workflows</span>
                            </a>
                            <a
                                href="/settings"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all group"
                            >
                                <Settings className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
                                <span>Settings</span>
                            </a>
                        </nav>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
})

NavSidebar.displayName = 'NavSidebar'
