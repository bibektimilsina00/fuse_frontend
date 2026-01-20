'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Package,
    Download,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { pluginsApi, PluginStatus } from '@/services/api/plugins'
import { cn } from '@/lib/utils'

function PluginCard({ plugin }: { plugin: PluginStatus }) {
    const isInstalled = plugin.installed
    const isActive = plugin.running

    return (
        <Link href={`/plugins/${plugin.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all h-full flex flex-col"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110",
                        plugin.id === "google-ai-antigravity"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-muted text-muted-foreground"
                    )}>
                        {plugin.icon === 'google_ai' ? <Zap className="h-6 w-6" /> : <Package className="h-6 w-6" />}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                Active
                            </span>
                        ) : isInstalled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                Installed
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                                Not Installed
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
                        {plugin.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {plugin.description}
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">
                        v{plugin.version}
                    </span>
                    <div className="text-xs text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                        Manage Plugin <ArrowRight className="h-3 w-3" />
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

export default function PluginsPage() {
    const { data: plugins = [], isLoading } = useQuery({
        queryKey: ['plugins'],
        queryFn: () => pluginsApi.getPlugins()
    })

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Plugins & Extensions</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Extend Fuse capabilities with specialized integrations and tools
                </p>
            </div>

            {/* Plugin Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-card border border-border rounded-xl p-6 h-48 animate-pulse" />
                    ))}
                </div>
            ) : plugins.length === 0 ? (
                <div className="empty-state py-12">
                    <div className="empty-state-icon mb-4">
                        <Package className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No plugins available</h3>
                    <p className="text-muted-foreground text-sm">
                        Check back later for new integrations.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {plugins.map(plugin => (
                        <PluginCard key={plugin.id} plugin={plugin} />
                    ))}

                    {/* Placeholder for future plugins */}
                    <div className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 hover:border-primary/30 transition-all cursor-not-allowed group">
                        <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-muted-foreground mb-1">More Coming Soon</h3>
                        <p className="text-xs text-muted-foreground/70 max-w-[180px]">
                            We are building more integrations for advanced workflows.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

import { Plus } from 'lucide-react'
