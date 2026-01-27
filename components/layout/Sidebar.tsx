'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Workflow,
    Play,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    Key,
    HelpCircle,
    BarChart3,
    Puzzle,
    Plus,
    Search,
    ChevronDown,
    MoreHorizontal
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

const mainNavItems = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
        badge: null
    },
    {
        title: 'Workflows',
        href: '/workflows',
        icon: Workflow,
        badge: null
    },
    {
        title: 'Executions',
        href: '/executions',
        icon: Play,
        badge: null
    },
    {
        title: 'Credentials',
        href: '/credentials',
        icon: Key,
        badge: null
    },
    {
        title: 'Variables',
        href: '/variables',
        icon: Puzzle,
        badge: 'Soon'
    },
]

const bottomNavItems = [
    {
        title: 'Nodes',
        href: '/nodes',
        icon: Puzzle,
    },
    {
        title: 'Templates',
        href: '/templates',
        icon: LayoutDashboard // Or maybe another icon
    },
    {
        title: 'Plugins',
        href: '/plugins',
        icon: Puzzle // Using Puzzle icon we imported earlier
    },
    {
        title: 'Analytics',
        href: '/analytics',
        icon: BarChart3
    },
    {
        title: 'Help',
        href: '/help',
        icon: HelpCircle
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
    const [showUserMenu, setShowUserMenu] = useState(false)

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 260 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="relative h-screen border-r border-border bg-card z-40 hidden md:flex flex-col"
        >
            {/* Logo Section */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="h-9 w-9 shrink-0 relative">
                        <Image
                            src="/logo.png"
                            alt="Fuse Logo"
                            width={36}
                            height={36}
                            className="object-contain"
                        />
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex items-center gap-1.5"
                            >
                                <span className="font-bold text-lg text-foreground">
                                    Fuse
                                </span>
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                    BETA
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Toggle button - always visible */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Quick Search - Only when expanded */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 py-3 border-b border-border"
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="search-input w-full"
                            />
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                ⌘K
                            </kbd>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Button */}
            <div className={cn("px-3 py-3", isCollapsed && "flex justify-center")}>
                {isCollapsed ? (
                    <Link href="/workflows/new">
                        <Button size="icon" className="h-10 w-10 rounded-xl">
                            <Plus className="h-5 w-5" />
                        </Button>
                    </Link>
                ) : (
                    <Link href="/workflows/new" className="block w-full">
                        <Button className="w-full justify-start gap-2">
                            <Plus className="h-4 w-4" />
                            Create Workflow
                        </Button>
                    </Link>
                )}
            </div>

            {/* Main Navigation */}
            <div className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
                {!isCollapsed && (
                    <p className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Main
                    </p>
                )}
                {mainNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "nav-item group",
                                isActive ? "nav-item-active" : "nav-item-inactive",
                                isCollapsed && "justify-center px-0"
                            )}
                            title={isCollapsed ? item.title : undefined}
                        >
                            <item.icon className={cn(
                                "h-[18px] w-[18px] shrink-0 transition-colors",
                                isActive ? "text-primary" : ""
                            )} />
                            {!isCollapsed && (
                                <>
                                    <span className="flex-1 text-sm">{item.title}</span>
                                    {item.badge && (
                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                            {isActive && !isCollapsed && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-primary rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                        </Link>
                    )
                })}

                {/* Divider */}
                <div className="!my-4 border-t border-border" />

                {/* Bottom nav items */}
                {!isCollapsed && (
                    <p className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        More
                    </p>
                )}
                {bottomNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "nav-item group",
                                isActive ? "nav-item-active" : "nav-item-inactive",
                                isCollapsed && "justify-center px-0"
                            )}
                            title={isCollapsed ? item.title : undefined}
                        >
                            <item.icon className={cn(
                                "h-[18px] w-[18px] shrink-0 transition-colors",
                                isActive ? "text-primary" : ""
                            )} />
                            {!isCollapsed && (
                                <span className="text-sm">{item.title}</span>
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Footer / User Profile */}
            <div className="p-3 border-t border-border">
                <div
                    className={cn(
                        "user-profile-card cursor-pointer relative",
                        isCollapsed && "justify-center p-2"
                    )}
                    onClick={() => !isCollapsed && setShowUserMenu(!showUserMenu)}
                >
                    {/* Avatar */}
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-white">A</span>
                    </div>

                    {!isCollapsed && (
                        <>
                            <div className="flex-1 overflow-hidden min-w-0">
                                <p className="text-sm font-medium truncate text-foreground">Admin</p>
                                <p className="text-xs text-muted-foreground truncate">admin@fuse.io</p>
                            </div>
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
                        </>
                    )}

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {showUserMenu && !isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                            >
                                <div className="p-1">
                                    <Link
                                        href="/settings/profile"
                                        className="dropdown-item"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="dropdown-item"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                    <div className="border-t border-border my-1" />
                                    <button className="dropdown-item w-full text-red-500 hover:bg-red-500/10">
                                        <LogOut className="h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.aside>
    )
}
