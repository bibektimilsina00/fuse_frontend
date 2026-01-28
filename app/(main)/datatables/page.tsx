'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Database,
    Plus,
    Search,
    MoreHorizontal,
    Table as TableIcon,
    Calendar,
    HardDrive,
    Trash2,
    Edit2,
    ChevronRight,
    Filter,
    ArrowUpDown,
    Download,
    Share2,
    RotateCcw,
    Table2,
    Activity,
    Weight,
    Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { CreateTableModal } from '@/components/datatables/CreateTableModal'
import { datatablesApi, DataTable } from '@/services/api/datatables'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { DataTableViewer } from '@/components/datatables/DataTableViewer'

export default function DataTablesPage() {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [view, setView] = useState<'grid' | 'list'>('grid')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedTable, setSelectedTable] = useState<DataTable | null>(null)

    // Fetch tables
    const { data: tables = [], isLoading, isError } = useQuery({
        queryKey: ['datatables'],
        queryFn: datatablesApi.getTables
    })

    // Create table mutation
    const createTableMutation = useMutation({
        mutationFn: (data: any) => datatablesApi.createTable({
            name: data.name,
            description: data.description || '',
            schema_definition: data.columns
        }),
        onSuccess: (newTable) => {
            queryClient.invalidateQueries({ queryKey: ['datatables'] })
            setIsCreateModalOpen(false)
            toast({
                title: "Table Created",
                description: `Successfully created "${newTable.name}" schema.`
            })
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to create table. Please try again.",
                variant: "destructive"
            })
        }
    })

    // Delete table mutation
    const deleteTableMutation = useMutation({
        mutationFn: (id: string) => datatablesApi.deleteTable(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['datatables'] })
            toast({
                title: "Table Deleted",
                description: "The data table and all its records have been removed."
            })
        }
    })

    const filteredTables = tables.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (selectedTable) {
        return (
            <div className="max-w-[1600px] mx-auto pb-20">
                <DataTableViewer
                    table={selectedTable}
                    onBack={() => setSelectedTable(null)}
                />
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gradient">Data Tables</h1>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Manage structured storage for your automated flows.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export All
                    </Button>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" />
                        New Data Table
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tables..."
                        className="pl-10 h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className={cn(view === 'grid' && "bg-background shadow-sm")} onClick={() => setView('grid')}>
                        <TableIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className={cn(view === 'list' && "bg-background shadow-sm")} onClick={() => setView('list')}>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    <div className="h-6 w-px bg-border mx-2" />
                    <Button variant="ghost" className="gap-2 text-[11px] font-bold uppercase tracking-wider">
                        <Filter className="h-3.5 w-3.5" />
                        Filters
                    </Button>
                    <Button variant="ghost" className="gap-2 text-[11px] font-bold uppercase tracking-wider">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        Sort
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-20 flex flex-col items-center justify-center gap-4"
                    >
                        <RotateCcw className="h-8 w-8 animate-spin text-primary/20" />
                        <span className="text-sm font-medium text-muted-foreground animate-pulse">Initializing data architect...</span>
                    </motion.div>
                ) : filteredTables.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-24 text-center space-y-6"
                    >
                        <div className="h-20 w-20 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto ring-1 ring-primary/10">
                            <Table2 className="h-10 w-10 text-primary/20" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">No data tables yet</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                                Create your first table to start storing and managing data for your automated workflows.
                            </p>
                        </div>
                        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 px-8">
                            <Plus className="h-4 w-4" />
                            Secure Your First Table
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            view === 'grid'
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                : "space-y-3"
                        )}
                    >
                        {filteredTables.map((table) => (
                            <div
                                key={table.id}
                                onDoubleClick={() => setSelectedTable(table)}
                                className="contents"
                            >
                                <Card
                                    className={cn(
                                        "group relative border-border/40 hover:border-primary/50 transition-all duration-500 cursor-pointer select-none overflow-hidden flex flex-col h-full bg-card/40 backdrop-blur-md",
                                        "hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.1)]",
                                        view === 'list' && "p-3 flex-row items-center justify-between"
                                    )}
                                >
                                    {/* Glassy Background Ornament & Grid Pattern */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />

                                    <div className={cn("relative flex gap-4 p-4 pb-3", view === 'list' && "p-0 items-center flex-1")}>
                                        <div className={cn(
                                            "flex items-center justify-center rounded-xl bg-gradient-to-br from-muted/80 to-muted text-muted-foreground transition-all duration-700",
                                            "group-hover:scale-105 group-hover:rotate-2 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20",
                                            view === 'grid' ? "h-11 w-11" : "h-9 w-9 shrink-0"
                                        )}>
                                            <Database className={view === 'grid' ? "h-5 w-5" : "h-4 w-4"} />
                                        </div>
                                        <div className="space-y-1.5 min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-bold tracking-tight text-base group-hover:text-primary transition-colors truncate">
                                                    {table.name}
                                                </h3>
                                                {view === 'grid' && (
                                                    <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-bold uppercase border-primary/20 text-primary/70 bg-primary/5">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/50 font-medium">
                                                <RotateCcw className="h-2.5 w-2.5 text-muted-foreground/40" />
                                                <span>Updated {formatDistanceToNow(new Date(table.updated_at))} ago</span>
                                            </div>
                                            {view === 'list' && (
                                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 font-medium pt-0.5">
                                                    <span className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-full ring-1 ring-border/5">
                                                        <Table2 className="h-2.5 w-2.5" />
                                                        {table._count?.rows || 0} Records
                                                    </span>
                                                    <span className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-full ring-1 ring-border/5">
                                                        <HardDrive className="h-2.5 w-2.5" />
                                                        {table.schema_definition.length} Fields
                                                    </span>
                                                    <span className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-full ring-1 ring-border/5">
                                                        <Zap className="h-2.5 w-2.5 text-amber-500/50" />
                                                        {((table._count?.rows || 0) * 0.5).toFixed(1)} KB
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {view === 'grid' && (
                                        <div className="px-4 py-1 flex items-center gap-3 text-[10px] text-muted-foreground/60 font-medium whitespace-nowrap overflow-hidden">
                                            <span className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-full ring-1 ring-border/5 shrink-0">
                                                <Table2 className="h-2.5 w-2.5" />
                                                {table._count?.rows || 0} Records
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-full ring-1 ring-border/5 shrink-0">
                                                <HardDrive className="h-2.5 w-2.5" />
                                                {table.schema_definition.length} Fields
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-full ring-1 ring-border/5 shrink-0">
                                                <Zap className="h-2.5 w-2.5 text-amber-500/50" />
                                                {((table._count?.rows || 0) * 0.5).toFixed(1)} KB
                                            </span>
                                        </div>
                                    )}

                                    {view === 'grid' && (
                                        <>
                                            <div className="mt-auto px-4 pb-4 pt-2.5 flex items-center justify-between border-t border-border/10">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground/30">Registry Ref</span>
                                                    <code className="text-[9px] bg-muted/50 px-1.5 py-0.5 rounded font-mono text-muted-foreground/60 group-hover:text-primary/70 transition-colors w-fit">
                                                        {table.id.slice(0, 8)}
                                                    </code>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all active:scale-95" onClick={(e) => e.stopPropagation()}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl border-white/5 shadow-2xl backdrop-blur-xl">
                                                        <DropdownMenuItem
                                                            className="rounded-xl gap-3 py-2.5 px-3 font-semibold text-sm transition-all focus:bg-primary/10 focus:text-primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setSelectedTable(table)
                                                            }}
                                                        >
                                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <TableIcon className="h-4 w-4 text-primary" />
                                                            </div>
                                                            Open Architect
                                                        </DropdownMenuItem>
                                                        <div className="h-px bg-border/40 my-1.5 mx-1" />
                                                        <DropdownMenuItem
                                                            className="rounded-xl gap-3 py-2.5 px-3 font-semibold text-sm text-destructive focus:bg-destructive/10 focus:text-destructive group/del"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                deleteTableMutation.mutate(table.id)
                                                            }}
                                                        >
                                                            <div className="h-8 w-8 rounded-lg bg-destructive/5 flex items-center justify-center group-hover/del:bg-destructive/10">
                                                                <Trash2 className="h-4 w-4" />
                                                            </div>
                                                            Purge Table
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </>
                                    )}

                                    {view === 'list' && (
                                        <div className="flex items-center gap-4 pr-1">
                                            <div className="hidden sm:flex flex-col items-end gap-0.5">
                                                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30">Last Modified</span>
                                                <span className="text-[10px] font-medium text-muted-foreground/50">{formatDistanceToNow(new Date(table.updated_at))} ago</span>
                                            </div>
                                            <code className="text-[9px] bg-muted/50 px-2 py-1 rounded font-mono text-muted-foreground/60">
                                                {table.id.slice(0, 8)}
                                            </code>
                                            <div className="h-6 w-px bg-border/40" />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg active:scale-95" onClick={(e) => e.stopPropagation()}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl border-white/5 shadow-2xl backdrop-blur-xl">
                                                    <DropdownMenuItem
                                                        className="rounded-xl gap-3 py-2.5 px-3 font-semibold text-sm transition-all focus:bg-primary/10 focus:text-primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setSelectedTable(table)
                                                        }}
                                                    >
                                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <TableIcon className="h-4 w-4 text-primary" />
                                                        </div>
                                                        Open Architect
                                                    </DropdownMenuItem>
                                                    <div className="h-px bg-border/40 my-1.5 mx-1" />
                                                    <DropdownMenuItem
                                                        className="rounded-xl gap-3 py-2.5 px-3 font-semibold text-sm text-destructive focus:bg-destructive/10 focus:text-destructive group/del"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            deleteTableMutation.mutate(table.id)
                                                        }}
                                                    >
                                                        <div className="h-8 w-8 rounded-lg bg-destructive/5 flex items-center justify-center group-hover/del:bg-destructive/10">
                                                            <Trash2 className="h-4 w-4" />
                                                        </div>
                                                        Purge Table
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </Card>

                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <CreateTableModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={(data) => createTableMutation.mutate(data)}
            />
        </div>
    )
}
