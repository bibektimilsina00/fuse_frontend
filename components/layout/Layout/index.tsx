import React from 'react'
import { Header } from '@/components/layout/Header'

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Header />
            <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
        </div>
    )
}
