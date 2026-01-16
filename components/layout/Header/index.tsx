import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/theme'
import { Settings, LogOut } from 'lucide-react'

export const Header: React.FC = () => {
    const auth = useAuth()

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-slate-900 dark:text-white">
                    Automation
                </Link>
                <nav className="flex items-center space-x-4">
                    <ThemeToggle />
                    {auth.user ? (
                        <>
                            <Link href="/" className="flex items-center space-x-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                                <span>Dashboard</span>
                            </Link>
                            <Link href="/profile" className="flex items-center space-x-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                                <Settings className="h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => auth.logout()}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                                Login
                            </Link>
                            <Button variant="default" size="sm" asChild>
                                <Link href="/register">Sign Up</Link>
                            </Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}
