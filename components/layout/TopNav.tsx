'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
    Bell,
    Search,
    HelpCircle,
    Settings,
    ChevronDown,
    Sparkles,
    Command,
    ExternalLink,
    Sun,
    Moon,
    Monitor
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAIAssistant } from '@/components/providers'

export function TopNav() {
    const { theme, setTheme } = useTheme()
    const { openAssistant } = useAIAssistant()
    const [mounted, setMounted] = useState(false)
    const [showThemeMenu, setShowThemeMenu] = useState(false)
    const [showHelpMenu, setShowHelpMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30">
            <div className="h-full px-6 flex items-center justify-between gap-4">
                {/* Left - Global Search */}
                <div className="flex-1 max-w-xl">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="Search workflows, nodes, templates..."
                            className="w-full pl-10 pr-20 py-2 bg-muted/50 border border-transparent rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-background transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <kbd className="text-[10px] font-mono text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                                ⌘
                            </kbd>
                            <kbd className="text-[10px] font-mono text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                                K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Right - Actions */}
                <div className="flex items-center gap-1">
                    {/* AI Assistant Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => openAssistant('help')}
                    >
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="hidden lg:inline">AI Assistant</span>
                    </Button>

                    {/* Divider */}
                    <div className="h-6 w-px bg-border mx-2" />

                    {/* Docs */}
                    <a
                        href="https://docs.fuse.io"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span className="hidden lg:inline">Docs</span>
                        </Button>
                    </a>

                    {/* Help */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowHelpMenu(!showHelpMenu)}
                        >
                            <HelpCircle className="h-4 w-4" />
                        </Button>

                        {showHelpMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowHelpMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-xl shadow-lg z-50 p-1.5">
                                    <a href="#" className="dropdown-item">Documentation</a>
                                    <a href="#" className="dropdown-item">Community</a>
                                    <a href="#" className="dropdown-item">What's New</a>
                                    <div className="border-t border-border my-1" />
                                    <a href="#" className="dropdown-item">Report a Bug</a>
                                    <a href="#" className="dropdown-item">Feature Request</a>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell className="h-4 w-4" />
                            {/* Notification Badge */}
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full" />
                        </Button>

                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                                    <div className="p-4 border-b border-border flex items-center justify-between">
                                        <h3 className="text-sm font-semibold">Notifications</h3>
                                        <button className="text-[10px] text-primary font-bold uppercase hover:underline">Mark all read</button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {[
                                            { title: 'Workflow Succeeded', desc: 'Marketing Sync completed in 1.2s', time: '5m ago', type: 'success' },
                                            { title: 'New Device Login', desc: 'Login detected from Chrome on Mac', time: '2h ago', type: 'alert' },
                                            { title: 'API Key Expiring', desc: 'Production key expires in 3 days', time: '1d ago', type: 'warning' },
                                        ].map((n, i) => (
                                            <div key={i} className="p-4 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer last:border-0">
                                                <div className="flex items-start gap-3">
                                                    <div className={cn(
                                                        "h-2 w-2 mt-1.5 rounded-full shrink-0",
                                                        n.type === 'success' ? 'bg-emerald-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-primary'
                                                    )} />
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold leading-none">{n.title}</p>
                                                        <p className="text-[10px] text-muted-foreground leading-relaxed">{n.desc}</p>
                                                        <p className="text-[9px] text-muted-foreground/60">{n.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t border-border bg-muted/20 text-center">
                                        <Button variant="ghost" size="sm" className="w-full text-xs h-8">View all notifications</Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowThemeMenu(!showThemeMenu)}
                        >
                            {mounted && theme === 'dark' ? (
                                <Moon className="h-4 w-4" />
                            ) : (
                                <Sun className="h-4 w-4" />
                            )}
                        </Button>

                        {showThemeMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowThemeMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-36 bg-popover border border-border rounded-xl shadow-lg z-50 p-1.5">
                                    <button
                                        onClick={() => { setTheme('light'); setShowThemeMenu(false) }}
                                        className={cn("dropdown-item w-full", theme === 'light' && "bg-muted")}
                                    >
                                        <Sun className="h-4 w-4" />
                                        Light
                                    </button>
                                    <button
                                        onClick={() => { setTheme('dark'); setShowThemeMenu(false) }}
                                        className={cn("dropdown-item w-full", theme === 'dark' && "bg-muted")}
                                    >
                                        <Moon className="h-4 w-4" />
                                        Dark
                                    </button>
                                    <button
                                        onClick={() => { setTheme('system'); setShowThemeMenu(false) }}
                                        className={cn("dropdown-item w-full", theme === 'system' && "bg-muted")}
                                    >
                                        <Monitor className="h-4 w-4" />
                                        System
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Settings */}
                    <Link href="/settings">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
