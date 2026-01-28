'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity,
    Zap,
    CheckCircle2,
    Plus,
    ArrowRight,
    Clock,
    MoreHorizontal,
    TrendingUp,
    TrendingDown,
    Play,
    AlertCircle,
    XCircle,
    ChevronRight,
    Search,
    Filter,
    Calendar,
    Key,
    Puzzle,
    Database,
    Shield,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Lock,
    Copy,
    RefreshCw,
    Workflow,
    Box,
    Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { AICreateDialog } from '@/components/ai/AICreateDialog'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDashboard } from './hooks/useDashboard'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { credentialsApi, Credential } from '@/services/api/credentials'
import { useDeleteWorkflow } from '@/services/queries/workflows'
import { CreateCredentialModal } from '@/components/credentials'
import { cn } from '@/lib/utils'

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
function StatCard({
    label,
    value,
    index
}: {
    label: string
    value: string
    change?: string
    trend?: 'up' | 'down'
    icon?: React.ComponentType<{ className?: string }>
    color?: string
    index: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            className="px-4 first:pl-0 last:pr-0"
        >
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className="mt-1">
                <span className="text-xl font-semibold">{value}</span>
            </div>
        </motion.div>
    )
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================
function StatusBadge({ status }: { status: 'success' | 'failed' | 'running' | 'pending' }) {
    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
            status === 'success' && "status-active",
            status === 'failed' && "status-error",
            status === 'running' && "status-running",
            status === 'pending' && "status-draft"
        )}>
            {status === 'success' && <CheckCircle2 className="h-3 w-3" />}
            {status === 'failed' && <XCircle className="h-3 w-3" />}
            {status === 'running' && <Play className="h-3 w-3 animate-pulse" />}
            {status === 'pending' && <Clock className="h-3 w-3" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )
}

// ============================================================================
// WORKFLOWS TAB CONTENT
// ============================================================================
function WorkflowsTabContent({ workflows, searchQuery }: { workflows: any[]; searchQuery: string }) {
    const filteredWorkflows = workflows.filter(w =>
        w.workflow.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (filteredWorkflows.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <Zap className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                    Create your first workflow to start automating your tasks
                </p>
                <Link href="/workflows/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Workflow
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {filteredWorkflows.map((run) => (
                <motion.div
                    key={run.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="workflow-row cursor-pointer select-none group/row hover:border-primary/50"
                    onDoubleClick={() => run.onEdit?.(run.id)}
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                            "h-2.5 w-2.5 rounded-full shrink-0",
                            run.status === 'success' && "bg-emerald-500",
                            run.status === 'failed' && "bg-red-500",
                            run.status === 'running' && "bg-sky-500 animate-pulse",
                            run.status === 'pending' && "bg-amber-500"
                        )} />
                        <div className="min-w-0">
                            <p className="font-medium text-sm truncate group-hover/row:text-primary transition-colors">{run.workflow}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-md">{run.description || 'No description'}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {run.time}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                            {run.duration}
                        </span>
                        <StatusBadge status={run.status} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => run.onEdit?.(run.id)}>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { }}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => run.onDelete?.(run.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </motion.div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                    Total {filteredWorkflows.length}
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
                    <select className="h-9 px-3 text-sm border border-border rounded-lg bg-background">
                        <option>50/page</option>
                        <option>100/page</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// CREDENTIALS TAB CONTENT
// ============================================================================
const CREDENTIAL_TYPES: Record<string, { iconPath: string; color: string; label: string }> = {
    google_sheets: { iconPath: '/assets/icons/credentials/productivity/google_sheets.svg', color: 'bg-green-500/20 text-green-400', label: 'Google Sheets' },
    slack: { iconPath: '/assets/icons/credentials/communication/slack.svg', color: 'bg-purple-500/20 text-purple-400', label: 'Slack' },
    discord: { iconPath: '/assets/icons/credentials/communication/discord.svg', color: 'bg-indigo-500/20 text-indigo-400', label: 'Discord' },
    ai_provider: { iconPath: '/assets/icons/credentials/ai/ai_provider.svg', color: 'bg-cyan-500/20 text-cyan-400', label: 'AI Provider' },
    webhook: { iconPath: '/assets/icons/credentials/integration/webhook.svg', color: 'bg-orange-500/20 text-orange-400', label: 'Webhook' },
    api_key: { iconPath: '/assets/icons/credentials/integration/api_key.svg', color: 'bg-amber-500/20 text-amber-400', label: 'API Key' },
    github: { iconPath: '/assets/icons/credentials/development/github.svg', color: 'bg-slate-500/20 text-slate-400', label: 'GitHub' },
    github_copilot: { iconPath: '/assets/icons/credentials/development/github_copilot.svg', color: 'bg-slate-500/20 text-slate-400', label: 'GitHub Copilot' },
    default: { iconPath: '/assets/icons/credentials/placeholder.svg', color: 'bg-gray-500/20 text-gray-400', label: 'Custom' }
}

function CredentialsTabContent({ searchQuery }: { searchQuery: string }) {
    const queryClient = useQueryClient()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingCredential, setEditingCredential] = useState<Credential | null>(null)
    const { data: credentials = [], isLoading } = useQuery({
        queryKey: ['credentials'],
        queryFn: () => credentialsApi.getCredentials()
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => credentialsApi.deleteCredential(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['credentials'] })
        }
    })

    const filteredCredentials = credentials.filter((cred: Credential) =>
        cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cred.type.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-muted" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-24 bg-muted rounded" />
                                <div className="h-3 w-16 bg-muted rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (filteredCredentials.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <Key className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No credentials yet</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                    Add your first credential to connect external services
                </p>
                <Link href="/credentials">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Credential
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCredentials.map((credential: Credential) => {
                const typeInfo = CREDENTIAL_TYPES[credential.type] || CREDENTIAL_TYPES.default
                return (
                    <motion.div
                        key={credential.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center p-2", typeInfo.color)}>
                                    <img src={typeInfo.iconPath} alt={typeInfo.label} className="h-full w-full object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">{credential.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">{typeInfo.label}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                        setEditingCredential(credential)
                                        setShowCreateModal(true)
                                    }}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => deleteMutation.mutate(credential.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                Created {new Date(credential.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-green-500" />
                                Encrypted
                            </div>
                        </div>
                    </motion.div>
                )
            })}
            <CreateCredentialModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false)
                    setEditingCredential(null)
                }}
                initialData={editingCredential}
            />
        </div>
    )
}

// ============================================================================
// EXECUTIONS TAB CONTENT
// ============================================================================
function ExecutionsTabContent({ workflows, searchQuery }: { workflows: any[]; searchQuery: string }) {
    // Mock executions from workflows
    const executions = workflows.flatMap((w, i) =>
        Array.from({ length: Math.min(2, i + 1) }, (_, j) => ({
            id: `exec-${w.id}-${j}`,
            workflow_id: w.id,
            workflow_name: w.workflow,
            status: (['success', 'success', 'failed', 'running'] as const)[Math.floor(Math.random() * 4)],
            started_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
            duration: `${(Math.random() * 5 + 0.5).toFixed(1)}s`,
        }))
    ).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())

    const filteredExecutions = executions.filter(e =>
        e.workflow_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (filteredExecutions.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <Play className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No executions yet</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                    Run your first workflow to see execution history here
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {filteredExecutions.map(execution => (
                <motion.div
                    key={execution.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center",
                                execution.status === 'success' ? 'bg-emerald-500/20' :
                                    execution.status === 'failed' ? 'bg-red-500/20' :
                                        execution.status === 'running' ? 'bg-sky-500/20' : 'bg-muted'
                            )}>
                                <Workflow className={cn(
                                    "h-5 w-5",
                                    execution.status === 'success' ? 'text-emerald-500' :
                                        execution.status === 'failed' ? 'text-red-500' :
                                            execution.status === 'running' ? 'text-sky-500' : 'text-muted-foreground'
                                )} />
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground">{execution.workflow_name}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {new Date(execution.started_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                                {execution.duration}
                            </span>
                            <StatusBadge status={execution.status} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

// ============================================================================
// VARIABLES TAB CONTENT
// ============================================================================
interface Variable {
    id: string
    key: string
    value: string
    type: 'string' | 'number' | 'boolean' | 'secret'
    description?: string
}

const mockVariables: Variable[] = [
    { id: '1', key: 'BASE_URL', value: 'https://api.example.com', type: 'string', description: 'Base URL for API requests' },
    { id: '2', key: 'MAX_RETRIES', value: '3', type: 'number', description: 'Maximum retry attempts' },
    { id: '3', key: 'DEBUG_MODE', value: 'true', type: 'boolean', description: 'Enable debug logging' },
]

function VariablesTabContent({ searchQuery }: { searchQuery: string }) {
    const [variables] = useState<Variable[]>(mockVariables)

    const typeColors: Record<string, string> = {
        string: 'bg-blue-500/20 text-blue-400',
        number: 'bg-purple-500/20 text-purple-400',
        boolean: 'bg-green-500/20 text-green-400',
        secret: 'bg-red-500/20 text-red-400'
    }

    const filteredVariables = variables.filter(v =>
        v.key.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (filteredVariables.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <Puzzle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No variables yet</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                    Create reusable variables for your workflows
                </p>
                <Link href="/variables">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variable
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {filteredVariables.map(variable => (
                <motion.div
                    key={variable.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <code className="text-sm font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                                {variable.key}
                            </code>
                            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded", typeColors[variable.type])}>
                                {variable.type.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                            <code className="text-sm font-mono text-foreground">{variable.value}</code>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    {variable.description && (
                        <p className="text-sm text-muted-foreground mt-3">{variable.description}</p>
                    )}
                </motion.div>
            ))}
        </div>
    )
}

// ============================================================================
// DATA TABLES TAB CONTENT (Coming Soon)
// ============================================================================
function DataTablesTabContent() {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <Database className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Data Tables</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                Store and manage structured data for your workflows. Coming soon!
            </p>
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                Coming Soon
            </span>
        </div>
    )
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================
export default function DashboardPage() {
    const router = useRouter()
    const {
        stats: dataStats,
        workflows: allWorkflows,
        handleAICreate,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab
    } = useDashboard()

    const deleteWorkflow = useDeleteWorkflow()
    const { data: credentials = [] } = useQuery({
        queryKey: ['credentials'],
        queryFn: () => credentialsApi.getCredentials()
    })

    const stats = [
        { label: 'Total Workflows', value: allWorkflows.length.toString() },
        { label: 'Active', value: allWorkflows.filter(w => w.meta.status === 'active').length.toString() },
        { label: 'Drafts', value: allWorkflows.filter(w => w.meta.status === 'draft').length.toString() },
        { label: 'Total Credentials', value: credentials.length.toString() },
        { label: 'Failure Rate', value: '0%' }
    ]

    const recentRuns = allWorkflows.map(w => ({
        id: w.id,
        workflow: w.meta.name,
        workflow_name: w.meta.name,
        description: w.meta.description,
        status: (w.meta.status === 'active' ? 'success' : w.meta.status === 'draft' ? 'pending' : 'failed') as any,
        time: new Date(w.meta.updated_at).toLocaleDateString() + ' ' + new Date(w.meta.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        started_at: w.meta.updated_at,
        duration: '—',
        onDelete: (id: string) => deleteWorkflow.mutate(id),
        onEdit: (id: string) => router.push(`/workflows/${id}`)
    }))

    const tabs = ['Workflows', 'Credentials', 'Executions', 'Variables', 'Data tables']

    const renderTabContent = () => {
        switch (activeTab) {
            case 'workflows':
                return <WorkflowsTabContent workflows={recentRuns} searchQuery={searchQuery} />
            case 'credentials':
                return <CredentialsTabContent searchQuery={searchQuery} />
            case 'executions':
                return <ExecutionsTabContent workflows={recentRuns} searchQuery={searchQuery} />
            case 'variables':
                return <VariablesTabContent searchQuery={searchQuery} />
            case 'data tables':
                return <DataTablesTabContent />
            default:
                return <WorkflowsTabContent workflows={recentRuns} searchQuery={searchQuery} />
        }
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        All the workflows, credentials and data tables you have access to
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/workflows/new">
                        <Button>
                            Create workflow
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Row */}
            <div className="rounded-lg border border-border bg-card p-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-0 md:divide-x divide-border">
                    {stats.map((stat, index) => (
                        <StatCard key={stat.label} {...stat} index={index} />
                    ))}
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab.toLowerCase())
                                    setSearchQuery('') // Reset search when switching tabs
                                }}
                                className={cn(
                                    "pb-3 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === tab.toLowerCase()
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search & Actions */}
                    <div className="flex items-center gap-3 pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab.toLowerCase()}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input w-48 !pl-9"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            Sort by last updated
                            <ChevronRight className="h-3 w-3 rotate-90" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Tab Content with Animation */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderTabContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
