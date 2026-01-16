'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Workflow,
    Settings,
    ChevronLeft,
    Menu,
    LogOut,
    User
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: 'Workflows',
        href: '/workflows',
        icon: Workflow
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings
    }
]

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="relative h-screen border-r border-border bg-card z-40 hidden md:flex flex-col"
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center px-6 border-b border-border">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <Workflow className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-bold text-lg whitespace-nowrap"
                            >
                                Automation
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            {!isCollapsed && (
                                <span className="truncate">{item.title}</span>
                            )}
                            {isActive && !isCollapsed && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border">
                                    {item.title}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Footer / User */}
            <div className="p-3 border-t border-border mt-auto">
                <div className={cn(
                    "flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/30",
                    isCollapsed ? "justify-center" : ""
                )}>
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">User Account</p>
                            <p className="text-xs text-muted-foreground truncate">user@example.com</p>
                        </div>
                    )}
                    {!isCollapsed && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>
        </motion.aside>
    )
}
