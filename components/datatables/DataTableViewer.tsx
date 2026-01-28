'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Plus,
    Search,
    Trash2,
    Edit2,
    ArrowLeft,
    Download,
    Filter,
    MoreHorizontal,
    Table as TableIcon,
    ChevronLeft,
    ChevronRight,
    Save,
    RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/utils'
import { DataTable, DataTableRow, datatablesApi } from '@/services/api/datatables'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'

interface DataTableViewerProps {
    table: DataTable
    onBack: () => void
}

export function DataTableViewer({ table, onBack }: DataTableViewerProps) {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [localData, setLocalData] = useState<Record<string, Record<string, any>>>({})
    const [dirtyRowIds, setDirtyRowIds] = useState<Set<string>>(new Set())

    const { data: rows = [], isLoading } = useQuery({
        queryKey: ['datatables', table.id, 'rows'],
        queryFn: async () => {
            const data = await datatablesApi.getRows(table.id)
            // Initialize local data when rows are fetched
            const initialData: Record<string, Record<string, any>> = {}
            data.forEach(row => {
                initialData[row.id] = { ...row.data }
            })
            setLocalData(initialData)
            return data
        }
    })

    const createRowMutation = useMutation({
        mutationFn: () => datatablesApi.createRow(table.id, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['datatables', table.id, 'rows'] })
            toast({ title: "Success", description: "Empty row added." })
        }
    })

    const updateRowMutation = useMutation({
        mutationFn: async ({ rowId, data }: { rowId: string, data: Record<string, any> }) =>
            datatablesApi.updateRow(table.id, rowId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['datatables', table.id, 'rows'] })
            const newDirty = new Set(dirtyRowIds)
            newDirty.delete(variables.rowId)
            setDirtyRowIds(newDirty)
            toast({ title: "Success", description: "Changes saved successfully." })
        }
    })

    const deleteRowMutation = useMutation({
        mutationFn: (rowId: string) => datatablesApi.deleteRow(table.id, rowId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['datatables', table.id, 'rows'] })
            toast({ title: "Success", description: "Row deleted." })
        }
    })

    const handleCellChange = (rowId: string, columnName: string, value: any) => {
        setLocalData(prev => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                [columnName]: value
            }
        }))
        const newDirty = new Set(dirtyRowIds)
        newDirty.add(rowId)
        setDirtyRowIds(newDirty)
    }

    const handleSaveRow = (rowId: string) => {
        updateRowMutation.mutate({ rowId, data: localData[rowId] })
    }

    const handleCancelRow = (rowId: string) => {
        const originalRow = rows.find(r => r.id === rowId)
        if (originalRow) {
            setLocalData(prev => ({
                ...prev,
                [rowId]: { ...originalRow.data }
            }))
            const newDirty = new Set(dirtyRowIds)
            newDirty.delete(rowId)
            setDirtyRowIds(newDirty)
        }
    }

    const filteredRows = rows.filter(row =>
        Object.values(localData[row.id] || row.data || {}).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        ) || searchQuery === ''
    )

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight">{table.name}</h2>
                            <Badge variant="outline" className="h-5 text-[10px] font-mono">
                                {rows.length} Rows
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{table.description || 'No description provided.'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {dirtyRowIds.size > 0 && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"
                            onClick={() => Array.from(dirtyRowIds).forEach(id => handleSaveRow(id))}
                            disabled={updateRowMutation.isPending}
                        >
                            <Save className="h-3.5 w-3.5" />
                            Save {dirtyRowIds.size} Changes
                        </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-2 shrink-0">
                        <Download className="h-3.5 w-3.5" />
                        Export
                    </Button>
                    <Button size="sm" className="gap-2 shrink-0" onClick={() => createRowMutation.mutate()}>
                        <Plus className="h-3.5 w-3.5" />
                        Add Row
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 p-3 bg-muted/20 rounded-xl border border-border/50">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Search rows..."
                        className="pl-9 h-9 text-sm bg-background border-border/40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-2 text-[11px] font-bold">
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                    </Button>
                    <div className="h-4 w-px bg-border/50" />
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 disabled:opacity-30">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-[10px] font-mono mx-2 text-muted-foreground">Page 1 of 1</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 disabled:opacity-30">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto rounded-xl border border-border shadow-sm bg-card">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-muted/50 sticky top-0 z-10 backdrop-blur-md">
                        <tr className="border-b border-border">
                            {table.schema_definition.map(col => (
                                <th key={col.id} className="p-3 font-bold text-muted-foreground whitespace-nowrap min-w-[150px]">
                                    <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                        {col.name}
                                        <Badge variant="secondary" className="px-1 py-0 h-3.5 text-[8px] opacity-40">
                                            {col.type}
                                        </Badge>
                                    </div>
                                </th>
                            ))}
                            <th className="p-3 w-16 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {isLoading ? (
                            <tr>
                                <td colSpan={table.schema_definition.length + 1} className="p-20 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <RotateCcw className="h-6 w-6 animate-spin text-primary/20" />
                                        <span className="text-xs font-medium animate-pulse">Loading table data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredRows.length === 0 ? (
                            <tr>
                                <td colSpan={table.schema_definition.length + 1} className="p-20 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <TableIcon className="h-6 w-6 text-muted-foreground/20" />
                                        <span className="text-xs font-medium">No results found.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredRows.map(row => (
                                <motion.tr
                                    key={row.id}
                                    layout
                                    className={cn(
                                        "transition-colors",
                                        dirtyRowIds.has(row.id) ? "bg-primary/[0.02]" : "hover:bg-muted/30"
                                    )}
                                >
                                    {table.schema_definition.map(col => {
                                        const value = (localData[row.id] && localData[row.id][col.name]) ?? row.data[col.name] ?? ''
                                        const isDirty = dirtyRowIds.has(row.id)
                                        return (
                                            <td key={col.id} className="p-1 px-3 whitespace-nowrap group/cell">
                                                <div className="relative">
                                                    <Input
                                                        value={value}
                                                        onChange={(e) => handleCellChange(row.id, col.name, e.target.value)}
                                                        className={cn(
                                                            "h-8 text-xs bg-transparent border-transparent hover:border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all px-2 font-medium",
                                                            !value && "text-muted-foreground/30 italic"
                                                        )}
                                                        placeholder="Enter value..."
                                                    />
                                                    {isDirty && (
                                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-primary/40 pointer-events-none" />
                                                    )}
                                                </div>
                                            </td>
                                        )
                                    })}
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center gap-1">
                                            {dirtyRowIds.has(row.id) ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10"
                                                        onClick={() => handleSaveRow(row.id)}
                                                        disabled={updateRowMutation.isPending}
                                                    >
                                                        {updateRowMutation.isPending ? (
                                                            <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Save className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:bg-muted"
                                                        onClick={() => handleCancelRow(row.id)}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-20 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-32 rounded-xl backdrop-blur-xl border-white/5 shadow-2xl">
                                                        <DropdownMenuItem onClick={() => deleteRowMutation.mutate(row.id)} className="gap-2 text-destructive focus:text-destructive py-2.5">
                                                            <Trash2 className="h-3.5 w-3.5" /> Delete Row
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}
