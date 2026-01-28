'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
    X,
    Plus,
    GripVertical,
    Trash2,
    Type,
    Hash,
    Calendar,
    ToggleLeft,
    Code,
    Settings2,
    Check,
    Database,
    ShieldCheck,
    ArrowRight,
    Search,
    Info,
    ChevronDown,
    ChevronUp,
    Key,
    Zap,
    LayoutTemplate,
    FileSpreadsheet,
    FileCode,
    Globe,
    Cloud,
    HardDrive,
    ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/utils'

interface Column {
    id: string
    name: string
    type: 'string' | 'number' | 'boolean' | 'date' | 'json'
    required: boolean
    unique: boolean
    indexed: boolean
    defaultValue?: string
    description?: string
}

interface CreateTableModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (tableData: { name: string; columns: Column[]; source?: string }) => void
}

const TYPE_CONFIG = {
    string: { icon: Type, label: 'Text', color: 'text-primary' },
    number: { icon: Hash, label: 'Number', color: 'text-primary' },
    boolean: { icon: ToggleLeft, label: 'Boolean', color: 'text-primary' },
    date: { icon: Calendar, label: 'Date', color: 'text-primary' },
    json: { icon: Code, label: 'JSON', color: 'text-primary' },
}

const SOURCES = [
    { id: 'scratch', name: 'Start from Scratch', description: 'Manually define terms and columns', icon: Plus, color: 'bg-primary/10 text-primary' },
    { id: 'csv', name: 'CSV / Excel', description: 'Import structure from a spreadsheet file', icon: FileSpreadsheet, color: 'bg-emerald-500/10 text-emerald-500' },
    { id: 'json', name: 'JSON Feed', description: 'Fetch schema from a JSON endpoint or file', icon: FileCode, color: 'bg-amber-500/10 text-amber-500' },
    { id: 'gsheets', name: 'Google Sheets', description: 'Sync with a live Google Spreadsheet', icon: Globe, color: 'bg-blue-500/10 text-blue-500' },
    { id: 'database', name: 'External Database', description: 'Connect to Postgres, MySQL, or Mongo', icon: HardDrive, color: 'bg-purple-500/10 text-purple-500' },
]

const TEMPLATES = [
    {
        name: 'User Profiles',
        columns: [
            { name: 'user_id', type: 'string', required: true, unique: true, indexed: true },
            { name: 'email', type: 'string', required: true, unique: true, indexed: true },
            { name: 'full_name', type: 'string', required: false, unique: false, indexed: false },
            { name: 'created_at', type: 'date', required: true, unique: false, indexed: true },
        ]
    },
    {
        name: 'Inventory Logs',
        columns: [
            { name: 'item_id', type: 'string', required: true, unique: false, indexed: true },
            { name: 'action', type: 'string', required: true, unique: false, indexed: false },
            { name: 'quantity', type: 'number', required: true, unique: false, indexed: false },
            { name: 'timestamp', type: 'date', required: true, unique: false, indexed: true },
        ]
    }
]

const spring = {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 1
}

export function CreateTableModal({ isOpen, onClose, onSave }: CreateTableModalProps) {
    const [step, setStep] = useState<'choice' | 'architect'>('choice')
    const [selectedSource, setSelectedSource] = useState<string | null>(null)
    const [tableName, setTableName] = useState('')
    const [columns, setColumns] = useState<Column[]>([])
    const [expandedColumnId, setExpandedColumnId] = useState<string | null>(null)

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('choice')
            setSelectedSource(null)
            setTableName('')
            setColumns([
                { id: Math.random().toString(36).substr(2, 9), name: 'id', type: 'string', required: true, unique: true, indexed: true }
            ])
            setExpandedColumnId(null)
        }
    }, [isOpen])

    const handleSourceSelect = (sourceId: string) => {
        setSelectedSource(sourceId)
        if (sourceId === 'scratch') {
            setStep('architect')
        } else {
            // In a real app, this would open a file picker or connection dialog
            // For now, let's simulate by going to architect with some auto-generated fields
            setStep('architect')
            if (sourceId === 'gsheets') setTableName('Google Sheet Import')
            if (sourceId === 'csv') setTableName('Imported Dataset')
        }
    }

    const addColumn = () => {
        const newColumn: Column = {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            type: 'string',
            required: false,
            unique: false,
            indexed: false
        }
        setColumns([...columns, newColumn])
    }

    const removeColumn = (id: string) => {
        if (columns.length > 1) {
            setColumns(columns.filter(c => c.id !== id))
        }
    }

    const updateColumn = (id: string, updates: Partial<Column>) => {
        setColumns(columns.map(c => c.id === id ? { ...c, ...updates } : c))
    }

    const applyTemplate = (template: typeof TEMPLATES[0]) => {
        setTableName(template.name)
        setColumns(template.columns.map(col => ({
            ...col as Column,
            id: Math.random().toString(36).substr(2, 9)
        })))
    }

    const duplicateNames = useMemo(() => {
        const names = columns.map(c => c.name.toLowerCase().trim()).filter(n => n !== '')
        return names.filter((name, index) => names.indexOf(name) !== index)
    }, [columns])

    const isValid = tableName.trim() !== '' &&
        columns.every(c => c.name.trim() !== '') &&
        duplicateNames.length === 0

    const handleSave = () => {
        console.log('Saving table:', tableName, columns)
        if (!isValid) return
        onSave({ name: tableName, columns, source: selectedSource || 'manual' })
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-background/30 backdrop-blur-[6px]"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={spring}
                className="relative w-full max-w-4xl h-full max-h-[750px] bg-card border border-border/50 shadow-[0_32px_128px_rgba(0,0,0,0.3)] rounded-3xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-3">
                        {step === 'architect' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStep('choice')}
                                className="h-8 w-8 p-0 rounded-lg hover:bg-white/5 mr-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <motion.div
                            key={step}
                            initial={{ rotate: -20, scale: 0.5 }}
                            animate={{ rotate: 0, scale: 1 }}
                            className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"
                        >
                            {step === 'choice' ? <Cloud className="h-4 w-4 text-primary" /> : <Database className="h-4 w-4 text-primary" />}
                        </motion.div>
                        <h2 className="text-sm font-bold tracking-tight">
                            {step === 'choice' ? 'Choose Data Source' : 'Configure Table Schema'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {step === 'architect' && (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                                            <LayoutTemplate className="h-3.5 w-3.5" />
                                            Load Template
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 z-[60] p-1.5 rounded-xl border border-white/10 bg-card/80 backdrop-blur-xl">
                                        {TEMPLATES.map((t) => (
                                            <DropdownMenuItem
                                                key={t.name}
                                                onSelect={() => applyTemplate(t)}
                                                className="text-xs cursor-pointer rounded-lg py-2"
                                            >
                                                {t.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <div className="h-4 w-px bg-border/50" />
                            </>
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:rotate-90 transition-transform">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {step === 'choice' ? (
                            <motion.div
                                key="choice"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full overflow-y-auto p-12"
                            >
                                <div className="max-w-2xl mx-auto space-y-8">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold tracking-tight">How would you like to start?</h3>
                                        <p className="text-muted-foreground text-sm">Select a source to define your table structure automatically or start fresh.</p>
                                    </div>

                                    <div className="grid gap-4">
                                        {SOURCES.map((source) => (
                                            <button
                                                key={source.id}
                                                onClick={() => handleSourceSelect(source.id)}
                                                className="group flex items-center gap-6 p-6 rounded-2xl border border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/20 transition-all text-left"
                                            >
                                                <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", source.color)}>
                                                    <source.icon className="h-7 w-7" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <h4 className="font-bold text-lg">{source.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{source.description}</p>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="architect"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full grid lg:grid-cols-[260px_1fr]"
                            >
                                {/* Left Pane */}
                                <div className="p-6 space-y-6 border-r border-border/50 bg-muted/10 h-full overflow-y-auto">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Identity</Label>
                                            <Input
                                                value={tableName}
                                                onChange={(e) => setTableName(e.target.value)}
                                                placeholder="e.g. users_v2"
                                                className="bg-background h-9 text-sm border-border/40 focus:ring-1 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Description</Label>
                                            <Textarea
                                                placeholder="Brief table purpose..."
                                                className="bg-background min-h-[80px] text-xs resize-none border-border/40 focus:ring-1 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border/50 space-y-4">
                                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground opacity-60">
                                            <span>Stats</span>
                                            <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] bg-primary/10 text-primary border-none">{columns.length} Fields</Badge>
                                        </div>
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-muted-foreground/80">Required fields</span>
                                                <span className="font-mono font-bold text-primary">{columns.filter(c => c.required).length}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-muted-foreground/80">Indexed fields</span>
                                                <span className="font-mono font-bold text-primary">{columns.filter(c => c.indexed).length}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedSource !== 'scratch' && (
                                        <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-orange-500 uppercase italic">
                                                <Info className="h-3 w-3" /> Source: {SOURCES.find(s => s.id === selectedSource)?.name}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                The schema has been initialized from your source. You can refine it below.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Pane */}
                                <div className="flex flex-col bg-background/50 overflow-hidden font-sans relative h-full">
                                    <div className="px-6 py-3 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-sm z-10">
                                        <span className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Column Schema</span>
                                        <Button onClick={addColumn} size="sm" variant="ghost" className="h-8 gap-2 text-primary hover:bg-primary/5 rounded-lg">
                                            <Plus className="h-3.5 w-3.5" />
                                            <span className="text-xs font-bold">Add Field</span>
                                        </Button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 space-y-3 relative">
                                        <LayoutGroup>
                                            <AnimatePresence mode="popLayout" initial={false}>
                                                {columns.map((column, index) => (
                                                    <motion.div
                                                        key={column.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                                                        transition={spring}
                                                        className={cn(
                                                            "group border rounded-xl bg-card transition-colors duration-200",
                                                            expandedColumnId === column.id ? "border-primary/40 ring-4 ring-primary/5" : "border-border/50 hover:border-primary/20",
                                                            duplicateNames.includes(column.name.toLowerCase().trim()) && "border-destructive/30 bg-destructive/[0.02]"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3 p-2 pr-4 relative">
                                                            <div className="h-8 w-8 flex items-center justify-center text-muted-foreground/20 group-hover:text-primary/30 shrink-0 cursor-grab hover:scale-110 transition-all">
                                                                <GripVertical className="h-4 w-4" />
                                                            </div>

                                                            <div className="flex-1">
                                                                <input
                                                                    value={column.name}
                                                                    onChange={(e) => updateColumn(column.id, { name: e.target.value })}
                                                                    placeholder="column_name"
                                                                    className="w-full bg-transparent outline-none h-8 font-bold text-sm placeholder:text-muted-foreground/20 focus:text-primary transition-colors"
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-[11px] font-bold hover:bg-muted/50 rounded-lg">
                                                                            {(() => {
                                                                                const Config = TYPE_CONFIG[column.type]
                                                                                return <Config.icon className="h-3.5 w-3.5 text-primary" />
                                                                            })()}
                                                                            {TYPE_CONFIG[column.type].label}
                                                                            <ChevronDown className="h-2.5 w-2.5 opacity-30" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-40 p-1.5 z-[60] rounded-xl border border-white/10 bg-card/80 backdrop-blur-xl">
                                                                        {(Object.entries(TYPE_CONFIG) as [Column['type'], typeof TYPE_CONFIG['string']][]).map(([type, config]) => (
                                                                            <DropdownMenuItem
                                                                                key={type}
                                                                                onSelect={() => updateColumn(column.id, { type: type as Column['type'] })}
                                                                                className="gap-2.5 rounded-lg py-2 transition-all cursor-pointer"
                                                                            >
                                                                                <config.icon className="h-4 w-4 text-primary" />
                                                                                <span className="text-xs font-medium">{config.label}</span>
                                                                                {column.type === type && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                                                                            </DropdownMenuItem>
                                                                        ))}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>

                                                                <div className="flex items-center gap-2 px-3 border-x border-border/40">
                                                                    <span className="text-[9px] font-black text-muted-foreground/50 tracking-tighter">REQ</span>
                                                                    <Switch
                                                                        checked={column.required}
                                                                        onCheckedChange={(checked) => updateColumn(column.id, { required: checked })}
                                                                        className="scale-[0.65]"
                                                                    />
                                                                </div>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={cn(
                                                                        "h-8 w-8 rounded-lg transition-all",
                                                                        expandedColumnId === column.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-primary/10 hover:text-primary"
                                                                    )}
                                                                    onClick={() => setExpandedColumnId(expandedColumnId === column.id ? null : column.id)}
                                                                >
                                                                    <Settings2 className="h-4 w-4" />
                                                                </Button>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-lg hover:text-destructive text-muted-foreground/20 hover:bg-destructive/10 hover:scale-110 transition-all"
                                                                    onClick={() => removeColumn(column.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <AnimatePresence mode="wait">
                                                            {expandedColumnId === column.id && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={spring}
                                                                    className="overflow-hidden border-t border-border/30 bg-muted/5 rounded-b-xl"
                                                                >
                                                                    <div className="p-5 grid grid-cols-2 gap-6 bg-gradient-to-b from-transparent to-muted/20">
                                                                        <div className="space-y-4">
                                                                            <div className="space-y-2">
                                                                                <Label className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">DEFAULT VALUE</Label>
                                                                                <Input
                                                                                    value={column.defaultValue || ''}
                                                                                    onChange={(e) => updateColumn(column.id, { defaultValue: e.target.value })}
                                                                                    placeholder="NULL"
                                                                                    className="h-8 text-xs bg-background border-border/40"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">CONSTRAINTS</Label>
                                                                                <div className="space-y-2">
                                                                                    <div className="flex items-center justify-between p-2 rounded-lg border border-border/30 bg-background/50 transition-all hover:border-primary/20">
                                                                                        <div className="flex items-center gap-2 text-[11px] font-bold">
                                                                                            <Key className="h-3 w-3 text-amber-500" />
                                                                                            Unique
                                                                                        </div>
                                                                                        <Switch
                                                                                            checked={column.unique}
                                                                                            onCheckedChange={(unique) => updateColumn(column.id, { unique })}
                                                                                            className="scale-[0.6]"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex items-center justify-between p-2 rounded-lg border border-border/30 bg-background/50 transition-all hover:border-primary/20">
                                                                                        <div className="flex items-center gap-2 text-[11px] font-bold">
                                                                                            <Zap className="h-3 w-3 text-blue-500" />
                                                                                            Index
                                                                                        </div>
                                                                                        <Switch
                                                                                            checked={column.indexed}
                                                                                            onCheckedChange={(indexed) => updateColumn(column.id, { indexed })}
                                                                                            className="scale-[0.6]"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">DESCRIPTION</Label>
                                                                            <Textarea
                                                                                value={column.description || ''}
                                                                                onChange={(e) => updateColumn(column.id, { description: e.target.value })}
                                                                                placeholder="Explain what this data is for..."
                                                                                className="min-h-[127px] text-xs bg-background border-border/40 resize-none transition-all focus:ring-1 focus:ring-primary/20 blur-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </LayoutGroup>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-border/50 flex items-center justify-between bg-muted/20">
                    <div className="flex flex-col gap-1">
                        {step === 'choice' ? (
                            <span className="text-[10px] text-muted-foreground/50 font-medium italic">
                                Choose a starting point to continue.
                            </span>
                        ) : !isValid ? (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-[10px] font-bold text-destructive uppercase tracking-widest"
                            >
                                <div className="h-1 w-1 rounded-full bg-destructive animate-pulse" />
                                {tableName.trim() === '' ? 'Table name is required' :
                                    columns.some(c => c.name.trim() === '') ? 'All field names must be filled' :
                                        duplicateNames.length > 0 ? 'Unique field names required' : ''}
                            </motion.div>
                        ) : (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Ready to deploy
                            </div>
                        )}
                    </div>

                    {step === 'architect' && (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" onClick={onClose}>Discard</Button>
                            <Button
                                onClick={handleSave}
                                disabled={!isValid}
                                className="gap-2 shadow-lg shadow-primary/20"
                            >
                                Create Data Table
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
