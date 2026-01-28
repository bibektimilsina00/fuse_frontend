import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useQueries } from '@tanstack/react-query'
import {
    X, Info, ChevronDown, Type, Hash, List, Code, Database,
    Key, Zap, Settings, HelpCircle, Play, ChevronRight,
    Layers, Terminal, FileJson, ArrowRightLeft,
    Command, Undo, Redo, Copy, ClipboardCheck,
    Beaker, Activity, History, Search, Cpu, Globe,
    MessageCircle, Brain, PlayCircle, CalendarClock,
    Webhook, Inbox, ClipboardList, Rss, Send, FileSpreadsheet,
    Split, Shuffle, GitMerge, RotateCw, PauseCircle, Clock as ClockIcon, Timer,
    Sliders, GripVertical, Table as TableIcon, Braces, Binary,
    Plus, Trash, MessageSquare, Edit3, GitBranch, Sparkles, Bot, Loader2, AlertCircle,
    LucideIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { CredentialInput } from './NodeConfigPanel/CredentialInput'
import { CodeEditor } from './NodeConfigPanel/CodeEditor'
import { CustomSelect } from './NodeConfigPanel/CustomSelect'
import { LogoWhatsApp, LogoPython, LogoGoogleSheets } from '../icons/BrandIcons'
import { workflowApi } from '@/services/api/workflows'
import type { Node, Edge } from 'reactflow'
import { NodeInputV2, NodeManifestV2, NodeTypeOutput, BaseNodeData } from '@/types/workflow'
import { FixedCollectionInput } from './inputs/FixedCollectionInput'
import { CollectionInput } from './inputs/CollectionInput'
import { DateTimeInput } from './inputs/DateTimeInput'
import { useNodeDisplayLogic } from '@/hooks/useNodeDisplayLogic'

import type { ComponentType } from 'react'

type IconComponent = LucideIcon | ComponentType<{ className?: string }>

interface NodeDetailsModalProps {
    node: Node<BaseNodeData>
    schema: NodeManifestV2
    allNodes: Node<BaseNodeData>[]
    edges: Edge[]
    onSelectNode: (node: Node<BaseNodeData>) => void
    onClose: () => void
    onUpdate: (nodeId: string, data: Partial<BaseNodeData>) => void
    onExecute?: (nodeId: string, config?: Record<string, unknown>, inputData?: Record<string, unknown>) => void
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
    isDirty?: boolean
}

const IconMap: Record<string, IconComponent> = {
    // Triggers
    'manual.trigger': PlayCircle,
    'schedule.cron': Timer,
    'webhook.receive': Webhook,
    'whatsapp.trigger': LogoWhatsApp,
    'email.trigger': Inbox,
    'rss.trigger': Rss,

    // AI
    'ai.llm': Sparkles,
    'ai.agent': Bot,

    // Actions
    'data.set': Edit3,
    'data.transform': Shuffle,
    'slack.send': MessageSquare,
    'whatsapp.send': LogoWhatsApp,
    'google_sheets.write': LogoGoogleSheets,
    'google_sheets.read': LogoGoogleSheets,
    'http.request': Globe,
    'code.python': LogoPython,
    'code.javascript': Code,
    'email.send': Send,
    'discord.send': Send,

    // Logic
    'condition.if': Split,
    'logic.parallel': GitBranch,
    'logic.merge': GitMerge,
    'logic.delay': ClockIcon,
    'logic.loop': RotateCw,
    'logic.switch': Shuffle,
    'logic.pause': PauseCircle,
    'execution.pause': PauseCircle,

    // Utilities
    'utility.noop': Activity
}

const DataExplorer: React.FC<{ data: any; mode: 'json' | 'table' | 'schema' }> = ({ data, mode }) => {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/20 opacity-40 py-10">
                <Database className="w-8 h-8 mb-2 stroke-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest">No Data Recorded</span>
            </div>
        )
    }

    if (mode === 'json') {
        return (
            <pre className="text-[9px] font-mono text-emerald-400/60 leading-tight">
                {JSON.stringify(data, null, 2)}
            </pre>
        )
    }

    if (mode === 'schema') {
        const getSchema = (obj: any, path = ''): any[] => {
            if (!obj || typeof obj !== 'object') return []
            return Object.entries(obj).flatMap(([key, val]) => {
                const currentPath = path ? `${path}.${key}` : key
                const type = Array.isArray(val) ? 'array' : typeof val
                const result = [{ path: currentPath, type }]
                if (type === 'object' && val !== null && !Array.isArray(val)) {
                    return [...result, ...getSchema(val, currentPath)]
                }
                return result
            })
        }
        const schema = getSchema(data)
        return (
            <div className="space-y-1">
                {schema.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1 px-2 bg-white/2 border border-white/5 rounded-sm">
                        <span className="text-[9px] font-mono text-muted-foreground">{item.path}</span>
                        <span className="text-[8px] font-bold uppercase text-primary/50 tracking-tighter">{item.type}</span>
                    </div>
                ))}
            </div>
        )
    }

    if (mode === 'table') {
        const rows = Array.isArray(data) ? data : [data]
        const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))))

        return (
            <div className="overflow-auto border border-border rounded-sm">
                <table className="w-full text-left text-[9px] border-collapse">
                    <thead className="bg-muted/50 sticky top-0">
                        <tr>
                            {headers.map(h => (
                                <th key={h} className="px-2 py-1.5 border-b border-border font-black uppercase text-muted-foreground/60">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                                {headers.map(h => (
                                    <td key={h} className="px-2 py-1.5 font-mono text-muted-foreground truncate max-w-[120px]">
                                        {typeof row[h] === 'object' ? '{...}' : String(row[h])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return null
}

const NavIcon: React.FC<{
    node: any
    onSelect: (node: any) => void
    direction: string
}> = ({ node, onSelect, direction }) => {
    const nodeName = node.data.node_name || ''
    const IconComponent = IconMap[nodeName] || (node.data.type === 'trigger' ? Zap : Settings)
    return (
        <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(var(--primary), 0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(node)}
            className="h-10 w-10 shrink-0 bg-card border border-border rounded-md flex items-center justify-center shadow-lg hover:border-primary/50 transition-all group relative"
            title={`${direction}: ${node.data.label}`}
        >
            <IconComponent className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-[8px] font-bold text-popover-foreground rounded-sm border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[110]">
                {node.data.label}
            </div>
        </motion.button>
    )
}

const Switch: React.FC<{
    checked: boolean
    onChange: (checked: boolean) => void
}> = ({ checked, onChange }) => (
    <div
        className={cn(
            "relative w-8 h-4.5 rounded-full transition-all duration-300 cursor-pointer",
            checked ? "bg-primary" : "bg-muted-foreground/20 hover:bg-muted-foreground/30"
        )}
        onClick={() => onChange(!checked)}
    >
        <motion.div
            animate={{ x: checked ? 16 : 2 }}
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-0.75 w-3 h-3 rounded-full bg-white shadow-sm"
        />
    </div>
)

export const NodeDetailsModal = ({
    node,
    schema,
    allNodes,
    edges,
    onSelectNode,
    onClose,
    onUpdate,
    onExecute,
    saveStatus = 'idle',
    isDirty = false
}: NodeDetailsModalProps) => {
    const [formData, setFormData] = useState<any>(node.data.config || {})
    const [settings, setSettings] = useState<any>(node.data.settings || {})
    const [activeTab, setActiveTab] = useState<'parameters' | 'settings'>('parameters')

    // Use our new hook for display logic
    const visibleInputs = useNodeDisplayLogic(schema?.inputs || [], formData)

    // Dynamic Options Queries using React Query
    const dynamicOptionQueries = useQueries({
        queries: schema.inputs.map(input => {
            const typeOpts = input.typeOptions || {};
            const method = typeOpts.loadOptionsMethod;
            // @ts-ignore
            const hasDynamic = !!method || !!(input as any).dynamic_options;

            // @ts-ignore
            const deps = typeOpts.loadOptionsDependsOn || (input as any).dynamic_dependencies || [];

            // Calculate current dependency values
            const dependencyValues: Record<string, any> = {};
            deps.forEach((d: string) => { dependencyValues[d] = formData[d] });

            // Check if enabled (has meaningful dependencies)
            const enabled = hasDynamic && Object.values(dependencyValues).some(v => v !== undefined && v !== '' && v !== null);

            // @ts-ignore
            const methodName = method || (input as any).dynamic_options;

            return {
                // @ts-ignore
                queryKey: ['node-options', schema.name || schema.id, input.name, dependencyValues],
                queryFn: async () => {
                    const res = await workflowApi.getNodeOptions(
                        // @ts-ignore
                        schema.name || schema.id,
                        methodName,
                        dependencyValues
                    );
                    return res;
                },
                enabled: !!enabled,
                staleTime: 1000 * 60 * 5, // Cache for 5 mins
            }
        })
    });

    const [inputViewMode, setInputViewMode] = useState<'json' | 'table' | 'schema'>('json')
    const [outputViewMode, setOutputViewMode] = useState<'json' | 'table' | 'schema'>('json')

    const [leftWidth, setLeftWidth] = useState(280)
    const [rightWidth, setRightWidth] = useState(320)
    const containerRef = useRef<HTMLDivElement>(null)
    const activeResizer = useRef<'left' | 'right' | null>(null)

    const handleMouseDown = (side: 'left' | 'right') => (e: React.MouseEvent) => {
        activeResizer.current = side
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
    }

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!activeResizer.current || !containerRef.current) return
        const containerRect = containerRef.current.getBoundingClientRect()
        if (activeResizer.current === 'left') {
            const newLeftWidth = e.clientX - containerRect.left
            if (newLeftWidth > 220 && newLeftWidth < containerRect.width * 0.45) setLeftWidth(newLeftWidth)
        } else if (activeResizer.current === 'right') {
            const newRightWidth = containerRect.right - e.clientX
            if (newRightWidth > 220 && newRightWidth < containerRect.width * 0.45) setRightWidth(newRightWidth)
        }
    }, [])

    const handleMouseUp = useCallback(() => {
        activeResizer.current = null
        document.body.style.cursor = 'default'
        document.body.style.userSelect = 'auto'
    }, [])

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [handleMouseMove, handleMouseUp])

    const lastNodeId = useRef<string | null>(null)
    useEffect(() => {
        if (node.id !== lastNodeId.current) {
            setFormData(node.data.config || {})
            setSettings(node.data.settings || {})
            lastNodeId.current = node.id
        }
    }, [node.id, node.data.config, node.data.settings])

    const handleChange = (name: string, value: any) => {
        const newData = { ...formData, [name]: value }
        setFormData(newData)
        onUpdate(node.id, {
            ...node.data,
            config: newData,
        })
    }

    const handleSettingsChange = (name: string, value: any) => {
        const newSettings = { ...settings, [name]: value }
        setSettings(newSettings)
        onUpdate(node.id, {
            ...node.data,
            settings: newSettings,
        })
    }



    const { previousNodes, nextNodes } = useMemo(() => {
        const prevIds = edges.filter(e => e.target === node.id).map(e => e.source)
        const nextIds = edges.filter(e => e.source === node.id).map(e => e.target)
        return {
            previousNodes: allNodes.filter(n => prevIds.includes(n.id)),
            nextNodes: allNodes.filter(n => nextIds.includes(n.id))
        }
    }, [node.id, allNodes, edges])

    // Compute the actual input data from previous nodes
    const effectiveInputData = useMemo(() => {
        // If the node already has explicit test input, use it
        const nodeInput = (node.data as unknown as Record<string, unknown>).input as Record<string, unknown> | undefined
        if (nodeInput && Object.keys(nodeInput).length > 0) {
            return nodeInput
        }

        // Otherwise, gather outputs from all connected previous nodes
        if (previousNodes.length === 0) return {}

        if (previousNodes.length === 1) {
            // Single predecessor: use its output directly
            return previousNodes[0].data.output || previousNodes[0].data.lastResult || {}
        }

        // Multiple predecessors: return a map of node id -> output
        const multiInput: Record<string, unknown> = {}
        previousNodes.forEach(prev => {
            multiInput[prev.id] = prev.data.output || prev.data.lastResult || {}
        })
        return multiInput
    }, [node.data, previousNodes])

    const getInputIcon = (type: string) => {
        switch (type) {
            case 'number': return <Hash className="w-3 h-3" />
            case 'select': return <List className="w-3 h-3" />
            case 'json': return <Database className="w-3 h-3" />
            case 'code': return <Code className="w-3 h-3" />
            case 'credential': return <Key className="w-3 h-3" />
            case 'messages': return <MessageSquare className="w-3 h-3" />
            default: return <Type className="w-3 h-3" />
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md pointer-events-auto">
            {/* Nav Wings */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                {previousNodes.map(n => <NavIcon key={n.id} node={n} onSelect={onSelectNode} direction="Prev" />)}
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                {nextNodes.map(n => <NavIcon key={n.id} node={n} onSelect={onSelectNode} direction="Next" />)}
            </div>

            {/* Main Shell */}
            <motion.div
                key={node.id}
                ref={containerRef}
                layoutId={`node-modal-${node.id}`}
                className="w-[1520px] h-[92vh] max-w-[96vw] bg-background border border-border shadow-2xl rounded-lg flex flex-col overflow-hidden ring-1 ring-white/5"
            >
                {/* Header - Simplified */}
                <header className="h-14 px-6 border-b border-border bg-muted/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            {(() => {
                                const nodeName = node.data.node_name || ''
                                const IconComp = IconMap[nodeName] || (node.data.type === 'trigger' ? Zap : Settings)
                                return <IconComp className="w-4 h-4 fill-current" />
                            })()}
                        </div>
                        <input
                            value={node.data.label}
                            onChange={(e) => onUpdate(node.id, { ...node.data, label: e.target.value })}
                            className="text-sm font-bold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary/20 rounded-sm px-1 -ml-1 w-96 hover:bg-white/5"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2 py-0.5 rounded-sm border border-border/50">{schema.displayName || schema.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-md h-8 w-8">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar */}
                    <aside style={{ width: leftWidth }} className="border-r border-border bg-muted/5 flex flex-col overflow-hidden shrink-0">
                        <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Input</span>
                            </div>
                            <div className="flex p-0.5 bg-background rounded-sm border border-border/50">
                                {[
                                    { id: 'json', icon: Braces },
                                    { id: 'table', icon: TableIcon },
                                    { id: 'schema', icon: Binary }
                                ].map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => setInputViewMode(v.id as any)}
                                        className={cn(
                                            "p-1 rounded-sm transition-all",
                                            inputViewMode === v.id ? "bg-muted text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                                        )}
                                    >
                                        <v.icon className="w-2.5 h-2.5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-black/10">
                            <DataExplorer data={effectiveInputData} mode={inputViewMode} />
                        </div>
                    </aside>

                    {/* Left Resize Handle */}
                    <div
                        onMouseDown={handleMouseDown('left')}
                        className="w-1.5 -mx-0.75 hover:bg-primary/50 cursor-col-resize transition-all shrink-0 z-20 flex items-center justify-center group"
                    >
                        <div className="h-8 w-1 rounded-full bg-border group-hover:bg-primary/50" />
                    </div>

                    {/* Center: Config */}
                    <main className="flex-1 flex flex-col bg-background overflow-y-auto custom-scrollbar">
                        {/* Center Tab Switcher & Execute Button */}
                        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-6 py-3 border-b border-border/50 flex items-center justify-between">
                            <div className="flex bg-muted/30 p-1 rounded-md shrink-0">
                                <button
                                    onClick={() => setActiveTab('parameters')}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-1.5 rounded-sm transition-all text-[10px] font-bold uppercase tracking-wider",
                                        activeTab === 'parameters' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Sliders className="w-3.5 h-3.5" />
                                    Parameters
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-1.5 rounded-sm transition-all text-[10px] font-bold uppercase tracking-wider",
                                        activeTab === 'settings' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    Settings
                                </button>
                            </div>

                            <Button
                                size="sm"
                                onClick={() => (onExecute as any)?.(node.id, formData, effectiveInputData)}
                                className="h-8 px-4 rounded-md bg-primary text-primary-foreground font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2"
                            >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                Run Step
                            </Button>
                        </div>

                        <div className="max-w-3xl mx-auto w-full p-10 space-y-8">
                            <AnimatePresence mode="wait">
                                {activeTab === 'parameters' ? (
                                    <motion.div
                                        key="p"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        {schema.inputs.length === 0 ? (
                                            <div className="py-20 text-center text-muted-foreground/30 flex flex-col items-center gap-4">
                                                <div className="p-6 rounded border border-dashed border-border"><Cpu className="w-10 h-10" /></div>
                                                <p className="text-[10px] uppercase font-bold tracking-widest">Default Configuration Only</p>
                                            </div>
                                        ) : (
                                            visibleInputs.map(input => {
                                                if ((input as any).show_if) {
                                                    // Legacy fallback
                                                    const isVisible = Object.entries((input as any).show_if).every(([key, val]) => formData[key] === val)
                                                    if (!isVisible) return null
                                                }
                                                return (
                                                    <div key={input.name} className="space-y-2">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                            {getInputIcon(input.type)}
                                                            {input.label}
                                                        </label>
                                                        {input.type === 'messages' ? (
                                                            <div className="space-y-4">
                                                                <div className="space-y-3">
                                                                    {(formData[input.name] || input.default || []).map((msg: any, idx: number) => (
                                                                        <div key={idx} className="relative group/msg p-4 bg-muted/10 border border-border rounded-xl space-y-3 transition-all hover:bg-muted/20">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="relative">
                                                                                    <select
                                                                                        value={msg.role}
                                                                                        onChange={(e) => {
                                                                                            const currentMsgs = formData[input.name] || input.default || [];
                                                                                            const newMsgs = [...currentMsgs];
                                                                                            newMsgs[idx] = { ...newMsgs[idx], role: e.target.value };
                                                                                            handleChange(input.name, newMsgs);
                                                                                        }}
                                                                                        className="pl-3 pr-8 py-1.5 bg-background border border-border rounded-lg text-[10px] font-bold uppercase tracking-wider appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20"
                                                                                    >
                                                                                        <option value="system">System (Goal)</option>
                                                                                        <option value="user">User (Request)</option>
                                                                                        <option value="assistant">AI (Response)</option>
                                                                                    </select>
                                                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40 pointer-events-none" />
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const currentMsgs = formData[input.name] || input.default || [];
                                                                                        const newMsgs = currentMsgs.filter((_: any, i: number) => i !== idx);
                                                                                        handleChange(input.name, newMsgs);
                                                                                    }}
                                                                                    className="p-1.5 text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                                                                >
                                                                                    <Trash className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </div>
                                                                            <textarea
                                                                                value={msg.content}
                                                                                onChange={(e) => {
                                                                                    const currentMsgs = formData[input.name] || input.default || [];
                                                                                    const newMsgs = [...currentMsgs];
                                                                                    newMsgs[idx] = { ...newMsgs[idx], content: e.target.value };
                                                                                    handleChange(input.name, newMsgs);
                                                                                }}
                                                                                className="w-full bg-transparent border-none text-xs placeholder:text-muted-foreground/30 focus:outline-none resize-none custom-scrollbar min-h-[60px]"
                                                                                placeholder="Type instructions or message... {{use_variables}}"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                    <button
                                                                        onClick={() => {
                                                                            const current = formData[input.name] || input.default || [];
                                                                            handleChange(input.name, [...current, { role: 'user', content: '' }]);
                                                                        }}
                                                                        className="w-full py-3 border border-dashed border-border rounded-xl text-[10px] font-bold text-muted-foreground/50 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                                        Add Interaction Step
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : input.type === 'code' ? (
                                                            <div className="rounded-md overflow-hidden border border-border shadow-inner bg-black/20">
                                                                <CodeEditor
                                                                    value={formData[input.name] || input.default || ''}
                                                                    onChange={(val) => handleChange(input.name, val)}
                                                                    language={schema.id.includes('python') ? 'python' : 'javascript'}
                                                                    height="400px"
                                                                    nodeId={node.id}
                                                                />
                                                            </div>
                                                        ) : input.type === 'select' ? (
                                                            <CustomSelect
                                                                value={formData[input.name] || input.default || ''}
                                                                onChange={(val) => handleChange(input.name, val)}
                                                                // @ts-ignore
                                                                options={dynamicOptionQueries[schema.inputs.indexOf(input)]?.data || (input.options as any[]) || []}
                                                                placeholder={`Select ${input.label.toLowerCase()}...`}
                                                                disabled={dynamicOptionQueries[schema.inputs.indexOf(input)]?.isLoading}
                                                                className="w-full"
                                                                itemIcon={input.name === 'spreadsheet_id' ? LogoGoogleSheets : undefined}
                                                            />
                                                        ) : input.type === 'credential' ? (
                                                            <CredentialInput
                                                                value={formData[input.name]}
                                                                onChange={(val) => handleChange(input.name, val)}
                                                                credentialType={(input as any).credential_type || 'generic'}
                                                                label={input.label}
                                                            />
                                                        ) : input.type === 'json' ? (
                                                            <div className="relative rounded-md overflow-hidden border border-border bg-slate-950 shadow-lg">
                                                                <div className="absolute top-2 right-2 flex gap-1 z-10">
                                                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">JSON</span>
                                                                </div>
                                                                <textarea
                                                                    value={
                                                                        formData[input.name] && typeof formData[input.name] === 'object'
                                                                            ? JSON.stringify(formData[input.name], null, 2)
                                                                            : formData[input.name] || ''
                                                                    }
                                                                    onChange={(e) => {
                                                                        try {
                                                                            const val = JSON.parse(e.target.value)
                                                                            handleChange(input.name, val)
                                                                        } catch {
                                                                            handleChange(input.name, e.target.value)
                                                                        }
                                                                    }}
                                                                    className="w-full px-4 py-4 bg-transparent text-slate-300 font-mono text-[11px] h-32 focus:outline-none transition-all shadow-inner resize-none custom-scrollbar"
                                                                    placeholder="{}"
                                                                />
                                                            </div>
                                                        ) : input.type === 'dateTime' ? (
                                                            <DateTimeInput
                                                                value={formData[input.name]}
                                                                onChange={(val) => handleChange(input.name, val)}
                                                            />
                                                        ) : input.type === 'collection' ? (
                                                            <CollectionInput
                                                                value={formData[input.name] || input.default || []}
                                                                onChange={(val) => handleChange(input.name, val)}
                                                                placeholder={input.placeholder}
                                                            />
                                                        ) : input.type === 'fixedCollection' ? (
                                                            <FixedCollectionInput
                                                                value={formData[input.name] || input.default || []}
                                                                onChange={(val) => handleChange(input.name, val)}
                                                                schema={{
                                                                    displayName: input.label,
                                                                    name: input.name,
                                                                    values: input.options as any[] || []
                                                                }}
                                                            />
                                                        ) : (
                                                            <input
                                                                className="w-full h-10 px-4 bg-muted/20 border border-border rounded-md text-xs focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/20"
                                                                value={formData[input.name] || ''}
                                                                onChange={(e) => handleChange(input.name, e.target.value)}
                                                                placeholder={`Enter ${input.label.toLowerCase()}...`}
                                                            />
                                                        )}
                                                    </div>
                                                )
                                            })
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="s"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="p-6 rounded-md bg-amber-500/5 border border-amber-500/10 flex gap-4">
                                            <Info className="w-5 h-5 text-amber-500 shrink-0" />
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">System-level orchestration: Configure retries, error handling, and timeout behavior for this internal node execution.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-md border border-border bg-card/50">
                                                <div className="space-y-1">
                                                    <div className="text-xs font-bold uppercase tracking-wider">Always Output Data</div>
                                                    <div className="text-[10px] text-muted-foreground">Return empty object if no results</div>
                                                </div>
                                                <Switch
                                                    checked={settings.alwaysOutputData}
                                                    onChange={(val) => handleSettingsChange('alwaysOutputData', val)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-md border border-border bg-card/50">
                                                <div className="space-y-1">
                                                    <div className="text-xs font-bold uppercase tracking-wider">Execute Once</div>
                                                    <div className="text-[10px] text-muted-foreground">Only run first time in a loop</div>
                                                </div>
                                                <Switch
                                                    checked={settings.executeOnce}
                                                    onChange={(val) => handleSettingsChange('executeOnce', val)}
                                                />
                                            </div>

                                            <div className="space-y-4 p-4 rounded-md border border-border bg-card/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-bold uppercase tracking-wider">Retry On Fail</div>
                                                        <div className="text-[10px] text-muted-foreground">Automatically retry if node fails</div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.retryOnFail}
                                                        onChange={(val) => handleSettingsChange('retryOnFail', val)}
                                                    />
                                                </div>

                                                {settings.retryOnFail && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        className="pt-4 space-y-4 border-t border-border/50"
                                                    >
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Max Retries</label>
                                                                <input
                                                                    type="number"
                                                                    value={settings.maxRetries ?? 3}
                                                                    onChange={(e) => handleSettingsChange('maxRetries', Number(e.target.value))}
                                                                    className="w-full h-10 px-4 bg-muted/20 border border-border rounded-md text-xs focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Retry Delay (s)</label>
                                                                <input
                                                                    type="number"
                                                                    value={settings.retryDelay ?? 5}
                                                                    onChange={(e) => handleSettingsChange('retryDelay', Number(e.target.value))}
                                                                    className="w-full h-10 px-4 bg-muted/20 border border-border rounded-md text-xs focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">On Error</label>
                                                <div className="relative">
                                                    <select
                                                        value={settings.onError || 'stop'}
                                                        onChange={(e) => handleSettingsChange('onError', e.target.value)}
                                                        className="w-full h-10 px-4 bg-muted/20 border border-border rounded-md text-xs focus:ring-1 focus:ring-primary/50 outline-none transition-all appearance-none"
                                                    >
                                                        <option value="stop">Stop Workflow</option>
                                                        <option value="continue">Continue (Ignore Error)</option>
                                                        <option value="retry">Retry and Stop</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Notes</label>
                                                <textarea
                                                    value={settings.notes || ''}
                                                    onChange={(e) => handleSettingsChange('notes', e.target.value)}
                                                    className="w-full px-4 py-3 bg-muted/20 border border-border rounded-md text-xs transition-all focus:ring-1 focus:ring-primary/50 outline-none h-32 resize-none custom-scrollbar"
                                                    placeholder="Add notes about what this node does..."
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-md border border-border bg-card/50">
                                                <div className="space-y-1">
                                                    <div className="text-xs font-bold uppercase tracking-wider">Display Note in Flow</div>
                                                    <div className="text-[10px] text-muted-foreground">Show this note on the canvas</div>
                                                </div>
                                                <Switch
                                                    checked={settings.displayNoteInFlow}
                                                    onChange={(val) => handleSettingsChange('displayNoteInFlow', val)}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </main>

                    {/* Right Resize Handle */}
                    <div
                        onMouseDown={handleMouseDown('right')}
                        className="w-1.5 -mx-0.75 hover:bg-primary/50 cursor-col-resize transition-all shrink-0 z-20 flex items-center justify-center group"
                    >
                        <div className="h-8 w-1 rounded-full bg-border group-hover:bg-primary/50" />
                    </div>

                    {/* Right Sidebar */}
                    <aside style={{ width: rightWidth }} className="border-l border-border bg-muted/5 flex flex-col overflow-hidden shrink-0 relative">
                        {/* Loading Overlay */}
                        {node.data.status === 'pending' && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Executing...</span>
                            </div>
                        )}

                        <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <FileJson className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Output</span>
                            </div>
                            <div className="flex p-0.5 bg-background rounded-sm border border-border/50">
                                {[
                                    { id: 'json', icon: Braces },
                                    { id: 'table', icon: TableIcon },
                                    { id: 'schema', icon: Binary }
                                ].map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => setOutputViewMode(v.id as any)}
                                        className={cn(
                                            "p-1 rounded-sm transition-all",
                                            outputViewMode === v.id ? "bg-muted text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                                        )}
                                    >
                                        <v.icon className="w-2.5 h-2.5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-black/10 flex flex-col gap-4">
                            {/* Error Alert */}
                            {node.data.status === 'failed' && (node.data as unknown as { error?: string }).error ? (
                                <div className="p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono break-words shrink-0">
                                    <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-wider">
                                        <AlertCircle className="w-4 h-4" />
                                        Execution Failed
                                    </div>
                                    {(node.data as unknown as { error?: string }).error}
                                </div>
                            ) : null}
                            <DataExplorer data={node.data.output} mode={outputViewMode} />
                        </div>
                    </aside>
                </div>

                {/* Footer */}
                <footer className="h-14 px-6 border-t border-border bg-card flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                saveStatus === 'saving' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" :
                                    (isDirty ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]")
                            )} />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                {saveStatus === 'saving' ? 'Saving changes...' :
                                    (isDirty ? 'Unsaved changes' : 'All changes saved')}
                            </span>
                        </div>
                        <div className="h-4 w-px bg-border/50 mx-2" />
                        <div className="flex items-center gap-2 opacity-30 grayscale pointer-events-none">
                            <LogoPython className="w-4 h-4 shadow-sm" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Engine Instance Ready</span>
                        </div>
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">
                        Node ID: {node.id}
                    </div>
                </footer>
            </motion.div >
        </div >
    )
}
