'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Braces,
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    Copy,
    Eye,
    EyeOff,
    Lock,
    RotateCcw,
    Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/DropdownMenu'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Variable {
    id: string
    key: string
    value: string
    type: 'string' | 'number' | 'boolean' | 'secret'
    description?: string
    created_at: string
    updated_at: string
}

// Mock data for now
const mockVariables: Variable[] = [
    {
        id: '1',
        key: 'BASE_URL',
        value: 'https://api.example.com',
        type: 'string',
        description: 'Base URL for API requests',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        key: 'MAX_RETRIES',
        value: '3',
        type: 'number',
        description: 'Maximum number of retry attempts',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        key: 'DEBUG_MODE',
        value: 'true',
        type: 'boolean',
        description: 'Enable debug logging',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

function VariableRow({ variable, onDelete }: { variable: Variable; onDelete: (id: string) => void }) {
    const [showValue, setShowValue] = useState(variable.type !== 'secret')

    const typeColors: Record<string, string> = {
        string: 'border-blue-500/20 text-blue-400 bg-blue-500/5',
        number: 'border-purple-500/20 text-purple-400 bg-purple-500/5',
        boolean: 'border-green-500/20 text-green-400 bg-green-500/5',
        secret: 'border-red-500/20 text-red-400 bg-red-500/5'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300"
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={cn(
                    "h-10 w-10 shrink-0 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all duration-500",
                    variable.type === 'secret' && "text-amber-500/50 bg-amber-500/5 text-amber-500"
                )}>
                    {variable.type === 'secret' ? <Lock className="h-5 w-5" /> : <Braces className="h-5 w-5" />}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                        <code className="text-sm font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                            {variable.key}
                        </code>
                        <Badge variant="outline" className={cn("h-4 px-1.5 text-[8px] font-bold uppercase", typeColors[variable.type])}>
                            {variable.type}
                        </Badge>
                    </div>
                    {variable.description && (
                        <p className="text-[11px] text-muted-foreground/60 truncate max-w-md">
                            {variable.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="flex items-center gap-2 bg-muted/30 p-1.5 px-3 rounded-xl border border-border/10">
                    <code className="text-[11px] font-mono font-medium text-muted-foreground/80 min-w-[100px]">
                        {showValue ? variable.value : '••••••••••••'}
                    </code>
                    <div className="flex items-center gap-0.5">
                        {variable.type === 'secret' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground/40 hover:text-primary transition-colors"
                                onClick={() => setShowValue(!showValue)}
                            >
                                {showValue ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground/40 hover:text-primary transition-colors"
                            onClick={() => navigator.clipboard.writeText(variable.value)}
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="h-4 w-px bg-border/20 mx-1" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl border-white/5 shadow-2xl backdrop-blur-xl">
                        <DropdownMenuItem className="rounded-xl gap-3 py-2.5 px-3 font-semibold text-sm transition-all focus:bg-primary/10 focus:text-primary">
                            <Edit2 className="h-4 w-4" /> Edit Variable
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(variable.id)}
                            className="rounded-xl gap-3 py-2.5 px-3 font-semibold text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" /> Delete Variable
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    )
}

function CreateVariableModal({ isOpen, onClose, onCreate }: {
    isOpen: boolean
    onClose: () => void
    onCreate: (variable: Omit<Variable, 'id' | 'created_at' | 'updated_at'>) => void
}) {
    const [key, setKey] = useState('')
    const [value, setValue] = useState('')
    const [type, setType] = useState<Variable['type']>('string')
    const [description, setDescription] = useState('')

    if (!isOpen) return null

    const handleCreate = () => {
        onCreate({ key, value, type, description })
        onClose()
        setKey('')
        setValue('')
        setType('string')
        setDescription('')
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4">Create Variable</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-1.5">Key</label>
                        <input
                            type="text"
                            value={key}
                            onChange={e => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono text-sm"
                            placeholder="MY_VARIABLE"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-1.5">Type</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value as Variable['type'])}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                        >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="secret">Secret</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-1.5">Value</label>
                        <input
                            type={type === 'secret' ? 'password' : 'text'}
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono text-sm"
                            placeholder="Enter value..."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-1.5">Description (optional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                            placeholder="What is this variable for?"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!key || !value}>
                        Create
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}

export default function VariablesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [variables, setVariables] = useState<Variable[]>(mockVariables)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const filteredVariables = variables.filter(v =>
        v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreate = (newVar: Omit<Variable, 'id' | 'created_at' | 'updated_at'>) => {
        setVariables(prev => [...prev, {
            ...newVar,
            id: `var-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }])
    }

    const handleDelete = (id: string) => {
        setVariables(prev => prev.filter(v => v.id !== id))
    }

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Braces className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Global Variables</h1>
                    </div>
                    <p className="text-muted-foreground/70 text-sm font-medium pl-1">
                        Securely store and manage reusable variables for all your automated workflows.
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="rounded-xl px-5 h-10 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2">
                    <Plus className="h-4 w-4" />
                    New Variable
                </Button>
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-muted/10 p-2 rounded-[2rem] border border-border/20 backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <input
                        type="text"
                        placeholder="Filter variables by key or purpose..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 bg-transparent border-none rounded-xl focus:ring-0 transition-all outline-none text-sm font-semibold placeholder:text-muted-foreground/30"
                    />
                </div>
                <div className="h-6 w-px bg-border/20 hidden lg:block" />
                <div className="px-4 py-2 bg-primary/5 rounded-2xl flex items-center gap-3 border border-primary/10">
                    <Zap className="h-4 w-4 text-primary" />
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                        Usage: <code className="bg-primary/10 px-1 rounded">{'{{$vars.KEY}}'}</code>
                    </p>
                </div>
            </div>

            {/* Variables Content */}
            <div className="relative space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredVariables.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 bg-muted/5 rounded-[2.5rem] border border-dashed border-border/50"
                        >
                            <div className="h-20 w-20 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto ring-1 ring-primary/10">
                                <Braces className="h-10 w-10 text-primary/20" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">No variables found</h2>
                                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                                    {searchQuery ? "Try refining your search terms or create a new variable." : "Start by creating a global variable that you can use across all your workflows."}
                                </p>
                            </div>
                            {!searchQuery && (
                                <Button onClick={() => setShowCreateModal(true)} className="gap-2 px-8 rounded-xl h-11 font-bold">
                                    <Plus className="h-4 w-4" />
                                    Define Your First Variable
                                </Button>
                            )}
                        </motion.div>
                    ) : (
                        filteredVariables.map((variable) => (
                            <VariableRow
                                key={variable.id}
                                variable={variable}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            <CreateVariableModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreate}
            />
        </div>
    )
}
