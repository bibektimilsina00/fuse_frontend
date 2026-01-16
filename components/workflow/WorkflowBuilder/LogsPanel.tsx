import React, { useEffect, useRef, useState } from 'react'
import { X, Terminal, AlertTriangle, CheckCircle, Info, ChevronRight, ChevronDown, Copy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface LogEntryData {
    input?: Record<string, unknown>
    output?: Record<string, unknown>
    error?: string
    category?: string
    suggestion?: string
    [key: string]: unknown
}

export interface LogEntry {
    id: string
    timestamp: string
    type: 'info' | 'success' | 'error' | 'warning'
    message: string
    nodeId?: string
    data?: LogEntryData
}

interface LogsPanelProps {
    logs: LogEntry[]
    isOpen: boolean
    onClose: () => void
    onClear: () => void
}

export function LogsPanel({ logs, isOpen, onClose, onClear }: LogsPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(320)
    const [isResizing, setIsResizing] = useState(false)
    const [justCopiedAll, setJustCopiedAll] = useState(false)

    // Handle resizing
    const onMouseDown = (e: React.MouseEvent) => {
        setIsResizing(true)
        e.preventDefault()
    }

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isResizing) return
            const newHeight = window.innerHeight - e.clientY
            if (newHeight > 100 && newHeight < window.innerHeight * 0.8) {
                setHeight(newHeight)
            }
        }

        const onMouseUp = () => {
            setIsResizing(false)
        }

        if (isResizing) {
            window.addEventListener('mousemove', onMouseMove)
            window.addEventListener('mouseup', onMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, [isResizing])

    const copyAllLogs = () => {
        const text = logs.map(log =>
            `[${new Date(log.timestamp).toLocaleString()}] ${log.type.toUpperCase()}: ${log.message}${log.data ? '\nData: ' + JSON.stringify(log.data, null, 2) : ''}`
        ).join('\n\n')
        navigator.clipboard.writeText(text)
        setJustCopiedAll(true)
        setTimeout(() => setJustCopiedAll(false), 2000)
    }

    // Auto-scroll to bottom when logs change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs, isOpen])

    if (!isOpen) return null

    return (
        <motion.div
            initial={{ height: 0, opacity: 0, y: 20 }}
            animate={{
                height: height,
                opacity: 1,
                y: 0,
                transition: isResizing ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }
            }}
            exit={{ height: 0, opacity: 0, y: 20 }}
            style={{ height }}
            className={cn(
                "fixed bottom-0 left-0 right-0 border-t border-border/50 bg-card/80 backdrop-blur-xl flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 overflow-hidden",
                isResizing && "transition-none select-none"
            )}
        >
            {/* Resize Handle */}
            <div
                onMouseDown={onMouseDown}
                className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-primary/30 transition-colors z-40 group flex items-center justify-center"
            >
                <div className="w-12 h-1 rounded-full bg-border group-hover:bg-primary/50" />
            </div>

            {/* Glossy Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-muted/40 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 border border-primary/20">
                        <Terminal className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold tracking-tight">Execution logs</h3>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center p-1 bg-background/80 backdrop-blur-sm rounded-xl border border-border shadow-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyAllLogs}
                            className={cn(
                                "h-8 text-[11px] font-bold transition-all px-3 gap-2 rounded-lg",
                                justCopiedAll
                                    ? "bg-emerald-500/20 text-emerald-600"
                                    : "hover:bg-primary/10 text-primary"
                            )}
                        >
                            {justCopiedAll ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>Copy All</span>
                        </Button>

                        <div className="w-px h-4 bg-border mx-1" />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="h-8 text-[11px] font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all px-3 gap-2 rounded-lg"
                        >
                            <Terminal className="h-3.5 w-3.5" />
                            <span>Clear Logs</span>
                        </Button>
                    </div>

                    <div className="w-px h-4 bg-border mx-1" />

                    <button
                        onClick={onClose}
                        className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Logs Stream */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-1.5 font-mono text-[10px] custom-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
            >
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
                        <Terminal className="h-8 w-8 stroke-1" />
                        <p className="max-w-[200px] text-xs leading-relaxed italic">
                            No active logs. Start a workflow to monitor execution in real-time.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {logs.map((log) => (
                            <LogItem key={log.id} log={log} />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

function LogItem({ log }: { log: LogEntry }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [justCopied, setJustCopied] = useState(false)
    const hasData = log.data && (Object.keys(log.data).length > 0)

    const copyData = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(JSON.stringify(log.data, null, 2))
    }

    const copyLogMessage = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(`[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`)
        setJustCopied(true)
        setTimeout(() => setJustCopied(false), 2000)
    }

    return (
        <div
            className={cn(
                "flex flex-col gap-1 p-1.5 rounded transition-all border border-transparent group",
                hasData && "cursor-pointer hover:bg-accent/40 hover:border-border/50",
                isExpanded && "bg-accent/30 border-border/50 shadow-sm"
            )}
            onClick={() => hasData && setIsExpanded(!isExpanded)}
        >
            <div className="flex gap-3 items-start">
                <span className="text-muted-foreground/50 w-20 shrink-0 select-none pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()}
                </span>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {hasData && (
                        <button className="p-0.5 hover:bg-muted rounded transition-colors shrink-0">
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </button>
                    )}

                    {log.type === 'success' && <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />}
                    {log.type === 'error' && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
                    {log.type === 'info' && <Info className="h-3 w-3 text-blue-500 shrink-0" />}

                    <span className={cn(
                        "font-medium text-[10px] break-all whitespace-pre-wrap leading-tight",
                        log.type === 'error' ? 'text-destructive' :
                            log.type === 'success' ? 'text-green-600 dark:text-green-400' :
                                'text-foreground'
                    )}>
                        {log.message}
                    </span>

                    {log.nodeId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground font-sans shrink-0">
                            {log.nodeId}
                        </span>
                    )}

                    <button
                        onClick={copyLogMessage}
                        className="ml-auto p-1.5 hover:bg-muted rounded-md transition-all shrink-0 border border-transparent hover:border-border text-muted-foreground/50 hover:text-foreground"
                        title="Copy message"
                    >
                        {justCopied ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground/50" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && hasData && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-[92px] mt-2 overflow-hidden"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        <div className="relative group/json">
                            <pre className="p-3 rounded-lg bg-slate-950 text-slate-300 overflow-x-auto text-[9px] border border-border/50 leading-relaxed shadow-inner">
                                {JSON.stringify(log.data, null, 2)}
                            </pre>
                            <button
                                onClick={copyData}
                                className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-md opacity-0 group-hover/json:opacity-100 transition-opacity text-slate-400"
                                title="Copy JSON"
                            >
                                <Copy className="h-3 w-3" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
