'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Puzzle,
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    Copy,
    Eye,
    EyeOff,
    Lock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
    const [showMenu, setShowMenu] = useState(false)

    const typeColors: Record<string, string> = {
        string: 'bg-blue-500/20 text-blue-400',
        number: 'bg-purple-500/20 text-purple-400',
        boolean: 'bg-green-500/20 text-green-400',
        secret: 'bg-red-500/20 text-red-400'
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <code className="text-sm font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                            {variable.key}
                        </code>
                        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded", typeColors[variable.type])}>
                            {variable.type.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                        {variable.type === 'secret' && (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <code className="text-sm font-mono text-foreground">
                            {showValue ? variable.value : '••••••••'}
                        </code>
                        {variable.type === 'secret' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setShowValue(!showValue)}
                            >
                                {showValue ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => navigator.clipboard.writeText(variable.value)}
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </div>

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
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                                    <Edit2 className="h-4 w-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete(variable.id)
                                        setShowMenu(false)
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {variable.description && (
                <p className="text-sm text-muted-foreground mt-3 pl-0">{variable.description}</p>
            )}
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
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
                            placeholder="MY_VARIABLE"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-1.5">Type</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value as Variable['type'])}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
                            placeholder="Enter value..."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-1.5">Description (optional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Variables</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Define reusable variables for your workflows
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search variables..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="search-input w-full !pl-9"
                    />
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Puzzle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                        <h3 className="font-medium text-sm">Using Variables in Workflows</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Reference variables in your workflows using <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{'{{$vars.VARIABLE_NAME}}'}</code>
                        </p>
                    </div>
                </div>
            </div>

            {/* Variables List */}
            {filteredVariables.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Puzzle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No variables yet</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                        Create reusable variables to use across all your workflows
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variable
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredVariables.map(variable => (
                        <VariableRow
                            key={variable.id}
                            variable={variable}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <CreateVariableModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreate}
            />
        </div>
    )
}
