'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers'
import { ThemeToggle } from '@/components/theme'
import { Button } from '@/components/ui'
import { LogOut, User, Workflow } from 'lucide-react'

export function Header() {
    const { user, logout } = useAuth()

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                                <Workflow className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                Automation
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                href="/dashboard"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/workflows"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                                Workflows
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <User className="h-4 w-4" />
                            <span className="hidden md:inline">{user?.email}</span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={logout}
                            className="gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden md:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
