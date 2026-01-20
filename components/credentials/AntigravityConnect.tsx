'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Zap,
    CheckCircle2,
    XCircle,
    ExternalLink,
    RefreshCcw,
    ChevronRight,
    Settings,
    Shield
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { aiApi, AntigravityStatus } from '@/services/api/ai'
import { cn } from '@/lib/utils'

export function AntigravityConnect() {
    const [isConnecting, setIsConnecting] = useState(false)
    const queryClient = useQueryClient()

    const { data: status, isLoading, isError } = useQuery({
        queryKey: ['antigravity-status'],
        queryFn: () => aiApi.getAntigravityStatus(),
        refetchInterval: 5000 // Poll every 5 seconds
    })

    const loginMutation = useMutation({
        mutationFn: () => aiApi.startAntigravityLogin(),
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['antigravity-status'] })
            }
        },
        onSettled: () => {
            setIsConnecting(false)
        }
    })

    const handleConnect = async () => {
        setIsConnecting(true)
        loginMutation.mutate()
    }

    if (isLoading) return (
        <div className="h-32 bg-card/50 border border-border rounded-2xl animate-pulse" />
    )

    const isConnected = status?.accounts && status.accounts.length > 0

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden group"
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-primary/5 to-purple-500/5" />

            <div className="relative bg-card/40 backdrop-blur-sm border border-border group-hover:border-primary/20 transition-all rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110",
                            isConnected ? "bg-primary/20 text-primary shadow-primary/10" : "bg-muted text-muted-foreground"
                        )}>
                            <Zap className={cn("h-7 w-7", isConnected && "fill-current")} />
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold tracking-tight">Google AI / Claude Antigravity</h2>
                                {isConnected ? (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Connected
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                                        <Shield className="h-3 w-3" />
                                        Ready to Connect
                                    </div>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                                Get access to high-tier models like <span className="text-foreground font-medium">Claude 3.5/4.5 Sonnet</span> and <span className="text-foreground font-medium">Gemini 3 Pro</span> through your Google account. Zero setup required.
                            </p>

                            <AnimatePresence>
                                {isConnected && status.accounts && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex items-center gap-2 mt-3"
                                    >
                                        <div className="text-[11px] text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                                            Active Account: {status.accounts[0]}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        {isConnected ? (
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto border-primary/20 hover:bg-primary/5 gap-2"
                                onClick={handleConnect}
                                loading={isConnecting}
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Re-authenticate
                            </Button>
                        ) : (
                            <Button
                                className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                onClick={handleConnect}
                                loading={isConnecting}
                            >
                                Connect Now
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}

                        <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_8px]", status?.installed ? "bg-green-500 shadow-green-500/50" : "bg-amber-500 shadow-amber-500/50")} />
                        <span className="text-muted-foreground uppercase font-bold tracking-tighter opacity-70">Binary:</span>
                        <span className="font-medium">{status?.installed ? 'Installed' : 'Needs Install'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_8px]", status?.running ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50")} />
                        <span className="text-muted-foreground uppercase font-bold tracking-tighter opacity-70">Server:</span>
                        <span className="font-medium">{status?.running ? 'Running' : 'Offline'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-muted-foreground uppercase font-bold tracking-tighter opacity-70">Port:</span>
                        <span className="font-medium text-primary">{status?.port || 8317}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
