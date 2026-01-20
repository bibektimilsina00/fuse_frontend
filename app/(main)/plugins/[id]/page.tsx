'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft,
    Package,
    Download,
    Play,
    Square,
    RefreshCcw,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Shield,
    Zap,
    Terminal,
    Cpu,
    Lock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { pluginsApi } from '@/services/api/plugins'
import { cn } from '@/lib/utils'
import { AntigravityConnect } from '@/components/credentials'

// Required for 'output: export' with dynamic routes
export async function generateStaticParams() {
    return [
        { id: 'google-ai-antigravity' }
    ]
}

export default function PluginDetailPage() {
    const params = useParams()
    const router = useRouter()
    const pluginId = params.id as string
    const queryClient = useQueryClient()
    const [isActionProcessing, setIsActionProcessing] = useState(false)

    // Fetch plugin details
    const { data: plugin, isLoading, isError } = useQuery({
        queryKey: ['plugin', pluginId],
        queryFn: () => pluginsApi.getPlugin(pluginId),
        refetchInterval: 5000 // Poll for status updates
    })

    const actionMutation = useMutation({
        mutationFn: ({ action }: { action: 'install' | 'start' | 'stop' }) =>
            pluginsApi.performAction(pluginId, action),
        onMutate: () => setIsActionProcessing(true),
        onSettled: () => setIsActionProcessing(false),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plugin', pluginId] })
        }
    })

    if (isLoading) return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading plugin details...</p>
            </div>
        </div>
    )

    if (isError || !plugin) return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Plugin Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested plugin could not be found or is attempting to load incorrect data.</p>
            <Link href="/plugins">
                <Button variant="outline">Back to Plugins</Button>
            </Link>
        </div>
    )

    const isAntigravity = plugin.id === 'google-ai-antigravity'

    const handleAction = (action: 'install' | 'start' | 'stop') => {
        actionMutation.mutate({ action })
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
                <Link href="/plugins" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    Plugins
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">{plugin.name}</span>
            </div>

            {/* Main Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-8 mb-8 relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    {isAntigravity ? <Zap className="h-64 w-64" /> : <Package className="h-64 w-64" />}
                </div>

                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    <div className={cn(
                        "h-24 w-24 rounded-2xl flex items-center justify-center text-4xl shadow-xl shrink-0",
                        isAntigravity ? "bg-blue-500 text-white shadow-blue-500/20" : "bg-muted text-muted-foreground"
                    )}>
                        {isAntigravity ? <Zap className="h-12 w-12" /> : <Package className="h-12 w-12" />}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold tracking-tight">{plugin.name}</h1>
                                <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono text-muted-foreground">v{plugin.version}</span>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                {plugin.description}
                            </p>
                        </div>

                        {/* Status Indicators */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border",
                                plugin.installed
                                    ? "bg-green-500/10 border-green-500/20 text-green-600"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                            )}>
                                {plugin.installed ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                                <span className="font-medium">{plugin.installed ? "Installed" : "Not Installed"}</span>
                            </div>

                            {plugin.installed && (
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border",
                                    plugin.running
                                        ? "bg-blue-500/10 border-blue-500/20 text-blue-600"
                                        : "bg-muted border-border text-muted-foreground"
                                )}>
                                    {plugin.running ? <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span> : <Square className="h-3 w-3 fill-current" />}
                                    <span className="font-medium">{plugin.running ? "Service Running" : "Service Audio-Stopped"}</span>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="pt-4 flex flex-wrap items-center gap-3">
                            {!plugin.installed ? (
                                <Button
                                    size="lg"
                                    className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                    onClick={() => handleAction('install')}
                                    loading={isActionProcessing && actionMutation.variables?.action === 'install'}
                                >
                                    <Download className="h-5 w-5" />
                                    Install Plugin
                                </Button>
                            ) : (
                                <>
                                    {plugin.running ? (
                                        <Button
                                            variant="outline"
                                            className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50"
                                            onClick={() => handleAction('stop')}
                                            loading={isActionProcessing && actionMutation.variables?.action === 'stop'}
                                        >
                                            <Square className="h-4 w-4 fill-current" />
                                            Stop Service
                                        </Button>
                                    ) : (
                                        <Button
                                            className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                                            onClick={() => handleAction('start')}
                                            loading={isActionProcessing && actionMutation.variables?.action === 'start'}
                                        >
                                            <Play className="h-4 w-4 fill-current" />
                                            Start Service
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Specific Plugin Dashboard content */}
            {isAntigravity && plugin.installed && (
                <div className="space-y-6">
                    {/* Authentication Section */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            Authentication
                        </h2>
                        {/* We reuse the component we built earlier, but maybe tailored */}
                        <AntigravityConnect />
                    </div>

                    {/* Technical Details */}
                    {plugin.details && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-primary" />
                                System Status
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-card border border-border rounded-xl p-5">
                                    <div className="text-sm text-muted-foreground mb-1">Local Port</div>
                                    <div className="text-xl font-mono text-foreground">{plugin.details.port || 8317}</div>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-5">
                                    <div className="text-sm text-muted-foreground mb-1">Process ID</div>
                                    <div className="text-xl font-mono text-foreground">{plugin.details.pid || 'N/A'}</div>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-5 md:col-span-2">
                                    <div className="text-sm text-muted-foreground mb-1">Configuration Path</div>
                                    <div className="font-mono text-xs text-muted-foreground bg-muted p-2 rounded mt-1 break-all">
                                        ~/.cli-proxy-api/config.yaml
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
