'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
    Play,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    ChevronRight,
    MoreHorizontal,
    RefreshCw,
    Eye,
    Workflow
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { workflowsApi } from '@/services/api/workflows'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Execution {
    id: string
    workflow_id: string
    workflow_name: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    started_at: string
    completed_at?: string
    duration?: string
    nodes_count?: number
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { icon: React.ReactNode; className: string }> = {
        completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: 'status-active' },
        failed: { icon: <XCircle className="h-3.5 w-3.5" />, className: 'status-error' },
        running: { icon: <RefreshCw className="h-3.5 w-3.5 animate-spin" />, className: 'status-running' },
        pending: { icon: <Clock className="h-3.5 w-3.5" />, className: 'status-draft' }
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border", config.className)}>
            {config.icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )
}

function ExecutionRow({ execution }: { execution: Execution }) {
    const [showMenu, setShowMenu] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        execution.status === 'completed' ? 'bg-emerald-500/20' :
                            execution.status === 'failed' ? 'bg-red-500/20' :
                                execution.status === 'running' ? 'bg-sky-500/20' : 'bg-muted'
                    )}>
                        <Workflow className={cn(
                            "h-5 w-5",
                            execution.status === 'completed' ? 'text-emerald-500' :
                                execution.status === 'failed' ? 'text-red-500' :
                                    execution.status === 'running' ? 'text-sky-500' : 'text-muted-foreground'
                        )} />
                    </div>
                    <div>
                        <h3 className="font-medium text-foreground">{execution.workflow_name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Started {new Date(execution.started_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                            {execution.duration || '—'}
                        </span>
                    </div>
                    <StatusBadge status={execution.status} />
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {showMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                                <Link
                                    href={`/workflows/${execution.workflow_id}?execution=${execution.id}`}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                </Link>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                                    <RefreshCw className="h-4 w-4" />
                                    Retry
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default function ExecutionsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // For now, let's create mock data. In production, this would fetch from an executions API
    const { data: workflows = [] } = useQuery({
        queryKey: ['workflows'],
        queryFn: () => workflowsApi.getWorkflows()
    })

    // Mock executions data - in production, you'd have a dedicated executions API
    const executions: Execution[] = workflows.flatMap((w, i) =>
        Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
            id: `exec-${w.id}-${j}`,
            workflow_id: w.id,
            workflow_name: w.meta.name,
            status: (['completed', 'completed', 'completed', 'failed', 'running'] as const)[
                Math.floor(Math.random() * 5)
            ],
            started_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
            completed_at: new Date().toISOString(),
            duration: `${(Math.random() * 5 + 0.5).toFixed(1)}s`,
            nodes_count: Math.floor(Math.random() * 10) + 1
        }))
    ).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())

    const filteredExecutions = executions.filter(exec => {
        const matchesSearch = exec.workflow_name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || exec.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const stats = {
        total: executions.length,
        completed: executions.filter(e => e.status === 'completed').length,
        failed: executions.filter(e => e.status === 'failed').length,
        running: executions.filter(e => e.status === 'running').length
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Executions</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Monitor and manage your workflow executions
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="rounded-lg border border-border bg-card p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x divide-border">
                    <div className="px-4 first:pl-0">
                        <span className="text-xs text-muted-foreground">Total</span>
                        <div className="mt-1">
                            <span className="text-xl font-semibold">{stats.total}</span>
                        </div>
                    </div>
                    <div className="px-4">
                        <span className="text-xs text-muted-foreground">Completed</span>
                        <div className="mt-1">
                            <span className="text-xl font-semibold text-emerald-500">{stats.completed}</span>
                        </div>
                    </div>
                    <div className="px-4">
                        <span className="text-xs text-muted-foreground">Failed</span>
                        <div className="mt-1">
                            <span className="text-xl font-semibold text-red-500">{stats.failed}</span>
                        </div>
                    </div>
                    <div className="px-4 last:pr-0">
                        <span className="text-xs text-muted-foreground">Running</span>
                        <div className="mt-1">
                            <span className="text-xl font-semibold text-sky-500">{stats.running}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search executions..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="search-input w-full !pl-9"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="h-9 px-3 text-sm border border-border rounded-lg bg-background"
                >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="running">Running</option>
                    <option value="pending">Pending</option>
                </select>
                <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    More Filters
                </Button>
            </div>

            {/* Executions List */}
            {filteredExecutions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No executions yet</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                        Run your first workflow to see execution history here
                    </p>
                    <Link href="/workflows">
                        <Button>
                            <Workflow className="h-4 w-4 mr-2" />
                            View Workflows
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredExecutions.map(execution => (
                        <ExecutionRow key={execution.id} execution={execution} />
                    ))}

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                            Showing {filteredExecutions.length} of {executions.length} executions
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                                1
                            </Button>
                            <Button variant="outline" size="sm">
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
