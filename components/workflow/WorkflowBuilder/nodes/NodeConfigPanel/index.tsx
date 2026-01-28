import React, { useEffect, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { X, Info, ChevronDown, Type, Hash, List, Code, Database, Key, Eye, EyeOff, Layout, Zap, Settings, HelpCircle, RotateCcw, AlertCircle, FileText, CheckCircle2, Plus, Trash, MessageSquare, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

import { CredentialInput } from './CredentialInput'
import { CodeEditor } from './CodeEditor'
import { workflowApi } from '@/services/api/workflows'
import { NodeInputV2, NodeManifestV2 } from '@/types/workflow'
import { useNodeDisplayLogic } from '@/hooks/useNodeDisplayLogic'

interface NodeConfigPanelProps {
    node: any
    schema: NodeManifestV2 // Use V2 Type
    onClose: () => void
    onUpdate: (nodeId: string, data: any) => void
    onExecute?: (nodeId: string, config?: any) => void
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
    isDirty?: boolean
}

const FieldWrapper: React.FC<{
    label: string
    required?: boolean
    description?: string
    icon?: React.ReactNode
    children: React.ReactNode
}> = ({ label, required, description, icon, children }) => (
    <div className="space-y-2.5">
        <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider flex items-center gap-1.5">
                {icon && <span className="text-muted-foreground/40">{icon}</span>}
                {label}
                {required && <span className="text-destructive font-bold">*</span>}
            </label>
            {description && (
                <div className="group relative">
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/40 cursor-help hover:text-primary transition-colors" />
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-popover/90 backdrop-blur-md text-popover-foreground text-xs rounded-xl shadow-2xl border border-border opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 translate-y-2 group-hover:translate-y-0">
                        <div className="font-bold mb-1 flex items-center gap-1.5 text-primary">
                            <Info className="w-3 h-3" />
                            Help
                        </div>
                        {description}
                    </div>
                </div>
            )}
        </div>
        <div className="relative group transition-all duration-200">
            {children}
        </div>
    </div>
)

const Switch: React.FC<{
    checked: boolean
    onChange: (checked: boolean) => void
}> = ({ checked, onChange }) => (
    <div
        className={cn(
            "relative w-9 h-5 rounded-full transition-all duration-300 cursor-pointer",
            checked ? "bg-primary shadow-[0_0_12px_-2px_rgba(59,130,246,0.5)]" : "bg-muted-foreground/20 hover:bg-muted-foreground/30"
        )}
        onClick={() => onChange(!checked)}
    >
        <motion.div
            animate={{ x: checked ? 18 : 2 }}
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm"
        />
    </div>
)

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
    node,
    schema,
    onClose,
    onUpdate,
    onExecute,
    saveStatus = 'idle',
    isDirty = false
}) => {
    const [formData, setFormData] = useState<any>(node.data.config || {})
    const [settings, setSettings] = useState<any>(node.data.settings || {})
    const [activeTab, setActiveTab] = useState<'parameters' | 'settings'>('parameters')

    useEffect(() => {
        setFormData(node.data.config || {})
        setSettings(node.data.settings || {})
    }, [node])

    // Use our new hook to determine visible inputs!
    const visibleInputs = useNodeDisplayLogic(schema?.inputs || [], formData)

    const handleSettingsChange = (name: string, value: any) => {
        const newSettings = { ...settings, [name]: value }
        setSettings(newSettings)
        onUpdate(node.id, {
            ...node.data,
            settings: newSettings,
        })
    }

    const handleChange = (name: string, value: any) => {
        const newData = { ...formData, [name]: value }
        setFormData(newData)
        onUpdate(node.id, {
            ...node.data,
            config: newData,
        })
    }

    // Dynamic Options Queries using React Query
    const dynamicOptionQueries = useQueries({
        queries: schema.inputs.map(input => {
            const typeOpts = input.typeOptions || {};
            const method = typeOpts.loadOptionsMethod;
            // @ts-ignore compatibility with old schema or new typeOptions
            const hasDynamic = !!method || !!(input as any).dynamic_options;

            // @ts-ignore
            const deps = typeOpts.loadOptionsDependsOn || (input as any).dynamic_dependencies || [];

            // Calculate current dependency values
            const dependencyValues: Record<string, any> = {};
            deps.forEach((d: string) => { dependencyValues[d] = formData[d] });

            // Check if enabled (has meaningful dependencies)
            const enabled = hasDynamic && Object.values(dependencyValues).some(v => v !== undefined && v !== '' && v !== null);

            // Use name or deprecated dynamic_options (method name)
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
        <motion.div
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            className="absolute right-4 top-4 bottom-4 w-[340px] bg-card/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-30 ring-1 ring-black/5"
        >
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Header */}
            <div className="relative p-5 bg-background/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
                <div className="min-w-0 pr-4">
                    <div className="flex flex-col gap-0.5">
                        <input
                            value={node.data.label}
                            onChange={(e) => onUpdate(node.id, { ...node.data, label: e.target.value })}
                            className="font-bold text-lg text-foreground bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 w-full transition-all"
                        />
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="text-[10px] text-primary/70 font-bold uppercase tracking-[0.15em] shrink-0">{schema.category}</span>
                            <span className="text-[10px] text-muted-foreground/40">•</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{schema.displayName || schema.id}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onExecute?.(node.id, formData)}
                        className="h-8 px-3 rounded-xl hover:bg-primary/10 text-primary opacity-0 group-hover:opacity-100 lg:opacity-100 transition-all flex items-center gap-2 border border-primary/20"
                    >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Run</span>
                    </Button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-2xl text-muted-foreground hover:text-foreground transition-all shrink-0 shadow-sm border border-transparent hover:border-white/10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex px-5 border-b border-white/5 bg-background/20 backdrop-blur-sm">
                <button
                    onClick={() => setActiveTab('parameters')}
                    className={cn(
                        "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative",
                        activeTab === 'parameters' ? "text-primary" : "text-muted-foreground/50 hover:text-muted-foreground"
                    )}
                >
                    Parameters
                    {activeTab === 'parameters' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                        "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative",
                        activeTab === 'settings' ? "text-primary" : "text-muted-foreground/50 hover:text-muted-foreground"
                    )}
                >
                    Settings
                    {activeTab === 'settings' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="relative flex-1 overflow-y-auto p-5 custom-scrollbar bg-transparent">
                <AnimatePresence mode="wait">
                    {activeTab === 'parameters' ? (
                        <motion.div
                            key="parameters"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-7"
                        >
                            {schema.inputs.length === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                                        <Settings className="h-8 w-8 text-muted-foreground/20 stroke-1" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground italic">No configuration available</p>
                                    <p className="text-[10px] text-muted-foreground/50 mt-1 max-w-[180px]">This node works using its default internal settings.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Specialized UI for Schedule */}
                                    {schema.id === 'schedule.cron' && (
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                    <Zap className="w-4 h-4" />
                                                </div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-primary/80">Trigger Interval</h4>
                                            </div>
                                            <div className="flex gap-2.5">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="number"
                                                        value={formData.interval ?? 15}
                                                        onChange={(e) => handleChange('interval', Number(e.target.value))}
                                                        className="w-full pl-3 pr-3 py-2.5 bg-background/50 border border-border/50 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none text-center font-bold"
                                                        placeholder="15"
                                                    />
                                                </div>
                                                <div className="relative flex-[1.5]">
                                                    <select
                                                        value={formData.frequency || 'seconds'}
                                                        onChange={(e) => handleChange('frequency', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-background/50 border border-border/50 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                                                    >
                                                        <option value="seconds">Seconds</option>
                                                        <option value="minutes">Minutes</option>
                                                        <option value="hours">Hours</option>
                                                        <option value="days">Days</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground/70 italic flex items-center gap-1.5 pl-1">
                                                <Info className="w-3 h-3" />
                                                Runs automatically at the set interval.
                                            </p>
                                        </div>
                                    )}

                                    {/* Generic Inputs - Use visibleInputs! */}
                                    {visibleInputs
                                        .filter(input => schema.id !== 'schedule.cron' || (input.name !== 'interval' && input.name !== 'frequency'))
                                        .map((input) => (
                                            <div key={input.name}>
                                                {input.type === 'messages' ? (
                                                    <div className="space-y-4 pt-2">
                                                        <div className="flex items-center justify-between px-1">
                                                            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                                                                <MessageSquare className="w-3.5 h-3.5" />
                                                                {input.label}
                                                            </label>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {(formData[input.name] || input.default || []).map((msg: any, idx: number) => (
                                                                <div key={idx} className="relative group/msg p-4 bg-background/50 border border-border/40 rounded-2xl space-y-3 transition-all hover:bg-background/80 hover:border-border/60 shadow-sm">
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
                                                                                className="pl-3 pr-8 py-1.5 bg-muted/40 border border-border/40 rounded-xl text-[10px] font-bold uppercase tracking-wider appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all hover:bg-muted/60 text-muted-foreground"
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
                                                                        className="w-full bg-transparent border-none text-sm placeholder:text-muted-foreground/20 focus:outline-none resize-none custom-scrollbar min-h-[80px]"
                                                                        placeholder="Type instructions or message... {{use_variables}}"
                                                                    />
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={() => {
                                                                    const current = formData[input.name] || input.default || [];
                                                                    handleChange(input.name, [...current, { role: 'user', content: '' }]);
                                                                }}
                                                                className="w-full py-4 border border-dashed border-border/60 rounded-2xl text-xs font-bold text-muted-foreground/50 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group shadow-sm bg-background/20"
                                                            >
                                                                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                                Add Interaction Step
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : input.type === 'credential' ? (
                                                    <div className="space-y-2.5">
                                                        <div className="flex items-center gap-2 px-1">
                                                            <Key className="w-3.5 h-3.5 text-muted-foreground/60" />
                                                            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                                Connected Account
                                                            </label>
                                                        </div>
                                                        <CredentialInput
                                                            value={formData[input.name]}
                                                            onChange={(val) => handleChange(input.name, val)}
                                                            credentialType={(input as any).credential_type || 'generic'}
                                                            label={input.label}
                                                        />
                                                    </div>
                                                ) : (
                                                    <FieldWrapper
                                                        label={input.label}
                                                        required={input.required}
                                                        description={input.description}
                                                        icon={getInputIcon(input.type)}
                                                    >
                                                        {input.type === 'string' && (
                                                            <div className="group/input">
                                                                <input
                                                                    type="text"
                                                                    value={formData[input.name] || ''}
                                                                    onChange={(e) => handleChange(input.name, e.target.value)}
                                                                    className="w-full px-4 py-2.5 bg-background/60 hover:bg-background/80 border border-border/60 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm placeholder:text-muted-foreground/30"
                                                                    placeholder={(input.default as string) || `Enter ${input.label.toLowerCase()}...`}
                                                                />
                                                            </div>
                                                        )}
                                                        {input.type === 'text' && (
                                                            <div className="group/input">
                                                                <textarea
                                                                    value={formData[input.name] || ''}
                                                                    onChange={(e) => handleChange(input.name, e.target.value)}
                                                                    className="w-full px-4 py-3 bg-background/60 hover:bg-background/80 border border-border/60 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm placeholder:text-muted-foreground/30 min-h-[120px] resize-y custom-scrollbar"
                                                                    placeholder={(input.default as string) || `Enter ${input.label.toLowerCase()}...`}
                                                                />
                                                            </div>
                                                        )}
                                                        {input.type === 'number' && (
                                                            <input
                                                                type="number"
                                                                value={formData[input.name] ?? ''}
                                                                onChange={(e) => handleChange(input.name, e.target.value === '' ? '' : Number(e.target.value))}
                                                                className="w-full px-4 py-2.5 bg-background/60 border border-border/60 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                                                                placeholder={input.default?.toString() || '0'}
                                                            />
                                                        )}
                                                        {input.type === 'select' && (
                                                            <div className="relative">
                                                                <select
                                                                    value={formData[input.name] || input.default || ''}
                                                                    onChange={(e) => handleChange(input.name, e.target.value)}
                                                                    className="w-full px-4 py-2.5 bg-background/60 border border-border/60 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm pr-10"
                                                                    disabled={dynamicOptionQueries[schema.inputs.indexOf(input)]?.isLoading}
                                                                >
                                                                    {(dynamicOptionQueries[schema.inputs.indexOf(input)]?.isLoading) ? (
                                                                        <option>Loading...</option>
                                                                    ) : (dynamicOptionQueries[schema.inputs.indexOf(input)]?.data || input.options || []).map((opt: any) => (
                                                                        <option key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none p-1 rounded-lg bg-muted/40 group-hover:bg-muted/60 transition-colors">
                                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {input.type === 'json' && (
                                                            <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-slate-950 shadow-lg">
                                                                <div className="absolute top-2 right-2 flex gap-1 z-10">
                                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">JSON</span>
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
                                                                    className="w-full px-4 py-4 bg-transparent text-slate-300 font-mono text-xs h-48 focus:outline-none transition-all shadow-inner resize-none custom-scrollbar"
                                                                    placeholder="{}"
                                                                />
                                                            </div>
                                                        )}
                                                        {input.type === 'code' && (
                                                            <div className="rounded-2xl overflow-hidden border border-border/60 shadow-xl">
                                                                <CodeEditor
                                                                    value={formData[input.name] || input.default || ''}
                                                                    onChange={(val) => handleChange(input.name, val)}
                                                                    language={schema.id.includes('python') ? 'python' : 'javascript'}
                                                                    height="380px"
                                                                    nodeId={node.id}
                                                                />
                                                            </div>
                                                        )}
                                                    </FieldWrapper>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-6"
                        >
                            {/* Execution Controls */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-white/5 transition-all hover:bg-muted/30">
                                    <div className="space-y-0.5">
                                        <div className="text-[11px] font-black text-foreground uppercase tracking-widest">Always Output Data</div>
                                        <div className="text-[9px] text-muted-foreground/60 leading-tight">Return empty object if no results</div>
                                    </div>
                                    <Switch
                                        checked={settings.alwaysOutputData}
                                        onChange={(val) => handleSettingsChange('alwaysOutputData', val)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-white/5 transition-all hover:bg-muted/30">
                                    <div className="space-y-0.5">
                                        <div className="text-[11px] font-black text-foreground uppercase tracking-widest">Execute Once</div>
                                        <div className="text-[9px] text-muted-foreground/60 leading-tight">Only run first time in a loop</div>
                                    </div>
                                    <Switch
                                        checked={settings.executeOnce}
                                        onChange={(val) => handleSettingsChange('executeOnce', val)}
                                    />
                                </div>

                                <div className="space-y-4 p-3.5 rounded-2xl bg-muted/20 border border-white/5 transition-all hover:bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="text-[11px] font-black text-foreground uppercase tracking-widest">Retry On Fail</div>
                                            <div className="text-[9px] text-muted-foreground/60 leading-tight">Automatically retry if node fails</div>
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
                                            className="pt-2 space-y-4 border-t border-white/5"
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Max Retries</label>
                                                    <input
                                                        type="number"
                                                        value={settings.maxRetries ?? 3}
                                                        onChange={(e) => handleSettingsChange('maxRetries', Number(e.target.value))}
                                                        className="w-full h-9 px-3 bg-background/50 border border-border/50 rounded-xl text-xs focus:ring-1 focus:ring-primary/30 outline-none transition-all font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Retry Delay (s)</label>
                                                    <input
                                                        type="number"
                                                        value={settings.retryDelay ?? 5}
                                                        onChange={(e) => handleSettingsChange('retryDelay', Number(e.target.value))}
                                                        className="w-full h-9 px-3 bg-background/50 border border-border/50 rounded-xl text-xs focus:ring-1 focus:ring-primary/30 outline-none transition-all font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 ml-1">
                                        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground/40" />
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">On Error</label>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={settings.onError || 'stop'}
                                            onChange={(e) => handleSettingsChange('onError', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-background/60 border border-border/60 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm pr-10"
                                        >
                                            <option value="stop">Stop Workflow</option>
                                            <option value="continue">Continue (Ignore Error)</option>
                                            <option value="retry">Retry and Stop</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none p-1 rounded-lg bg-muted/40 transition-colors">
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2 ml-1">
                                        <FileText className="w-3.5 h-3.5 text-muted-foreground/40" />
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Notes</label>
                                    </div>
                                    <textarea
                                        value={settings.notes || ''}
                                        onChange={(e) => handleSettingsChange('notes', e.target.value)}
                                        className="w-full px-4 py-3 bg-background/60 hover:bg-background/80 border border-border/60 rounded-2xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm placeholder:text-muted-foreground/30 h-24 resize-none custom-scrollbar"
                                        placeholder="Add notes about what this node does..."
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-white/5 transition-all hover:bg-muted/30">
                                    <div className="space-y-0.5">
                                        <div className="text-[11px] font-black text-foreground uppercase tracking-widest">Display Note in Flow?</div>
                                        <div className="text-[9px] text-muted-foreground/60 leading-tight">Show this note on the canvas</div>
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

            {/* Footer / Status */}
            <div className="relative p-4 bg-background/50 backdrop-blur-md border-t border-white/5 flex justify-between items-center px-6">
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
                <div className="flex gap-2">
                    <div className="text-[9px] text-muted-foreground/30 font-mono">v1.2.0</div>
                </div>
            </div>
        </motion.div>
    )
}
