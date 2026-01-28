'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Sparkles,
    Send,
    MessageSquare,
    Settings2,
    Cpu,
    Wand2,
    HelpCircle,
    Lightbulb,
    Zap,
    Code,
    BookOpen,
    Copy,
    Check,
    RotateCcw,
    Minimize2,
    Maximize2,
    Info,
    Clock,
    TrendingUp,
    ArrowLeft,
    ChevronDown,
    Search
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { CredentialSelector } from '@/components/credentials/CredentialSelector'
import { aiApi } from '@/services/api/ai'
import { useQuery, useMutation } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type AssistantMode = 'help' | 'create'

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface AIAssistantProps {
    isOpen: boolean
    onClose: () => void
    onCreateWorkflow?: (prompt: string, model: string, credentialId?: string) => Promise<void>
    defaultMode?: AssistantMode
}

const AI_MODELS = [
    {
        id: 'openai/gpt-4o-mini',
        label: 'GPT-4o Mini',
        provider: 'openai',
        description: 'Fast & efficient',
        speed: 'Fast',
        quality: 'Good',
        cost: 'Low'
    },
    {
        id: 'openai/gpt-4o',
        label: 'GPT-4o',
        provider: 'openai',
        description: 'Most capable',
        speed: 'Medium',
        quality: 'Excellent',
        cost: 'Medium'
    },
    {
        id: 'anthropic/claude-3-5-sonnet',
        label: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        description: 'Best reasoning',
        speed: 'Medium',
        quality: 'Excellent',
        cost: 'Medium'
    },
    {
        id: 'google/gemini-2.0-flash',
        label: 'Gemini 2.0 Flash',
        provider: 'gemini',
        description: 'Google AI',
        speed: 'Very Fast',
        quality: 'Good',
        cost: 'Low'
    },
    {
        id: 'deepseek/deepseek-r1',
        label: 'DeepSeek R1',
        provider: 'openrouter',
        description: 'Advanced reasoning',
        speed: 'Slow',
        quality: 'Excellent',
        cost: 'Low'
    },
]

const COPILOT_MODELS = [
    {
        id: 'gpt-4o',
        label: 'GPT-4o',
        provider: 'copilot',
        description: 'GitHub Copilot',
        speed: 'Fast',
        quality: 'Excellent',
        cost: 'Included'
    },
    {
        id: 'claude-3.5-sonnet',
        label: 'Claude 3.5 Sonnet',
        provider: 'copilot',
        description: 'GitHub Copilot',
        speed: 'Medium',
        quality: 'Excellent',
        cost: 'Included'
    },
    {
        id: 'o1-preview',
        label: 'o1 Preview',
        provider: 'copilot',
        description: 'Reasoning',
        speed: 'Slow',
        quality: 'Best',
        cost: 'Included'
    }
]

const GOOGLE_MODELS = [
    {
        id: 'gemini-2.0-flash-exp',
        label: 'Gemini 2.0 Flash',
        provider: 'google',
        description: 'Experimental',
        speed: 'Very Fast',
        quality: 'Good',
        cost: 'Free'
    },
    {
        id: 'gemini-1.5-pro-latest',
        label: 'Gemini 1.5 Pro',
        provider: 'google',
        description: 'Production',
        speed: 'Fast',
        quality: 'Great',
        cost: 'Free'
    }
]

const HELP_SUGGESTIONS = [
    { icon: Code, text: 'How do I use variables in workflows?', category: 'Basics' },
    { icon: Zap, text: 'What triggers are available?', category: 'Triggers' },
    { icon: BookOpen, text: 'How to connect to Google Sheets?', category: 'Integrations' },
    { icon: Lightbulb, text: 'Best practices for error handling', category: 'Advanced' },
]

const CREATE_SUGGESTIONS = [
    'Send daily email report from Google Sheets',
    'Monitor website uptime and alert on Slack',
    'Auto-respond to WhatsApp messages with AI',
    'Sync data between Airtable and Notion',
]

const QUICK_ACTIONS = [
    { icon: Zap, label: 'Templates', description: 'Browse workflow templates' },
    { icon: BookOpen, label: 'Docs', description: 'Read documentation' },
    { icon: MessageSquare, label: 'Community', description: 'Join our community' },
]

const PROVIDER_ICONS: Record<string, string> = {
    openai: '/assets/icons/credentials/ai/openai.svg',
    anthropic: '/assets/icons/credentials/ai/anthropic.svg',
    google: '/assets/icons/credentials/ai/gemini.svg',
    deepseek: '/assets/icons/credentials/ai/ai_provider.svg',
    openrouter: '/assets/icons/credentials/ai/openrouter.svg',
    copilot: '/assets/icons/credentials/development/github_copilot.svg',
    default: '/assets/icons/credentials/placeholder.svg'
}

import { type AIModel } from '@/services/api/ai'

interface ModelSelectorProps {
    value: string
    onChange: (id: string) => void
    className?: string
    models: AIModel[]
}

function ModelSelector({ value, onChange, className, models }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    const triggerRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const filteredModels = models.filter(m =>
        m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const selectedModel = models.find(m => m.id === value) || models[0]

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width
            })
        }
    }, [isOpen])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleSelect = (id: string) => {
        onChange(id)
        setIsOpen(false)
        setSearchQuery('')
    }

    return (
        <>
            <div className={cn("relative", className)}>
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-background border border-border rounded-lg hover:border-primary/50 transition-all text-sm",
                        isOpen && "border-primary ring-2 ring-primary/20"
                    )}
                >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="h-5 w-5 shrink-0 flex items-center justify-center p-0.5">
                            <img
                                src={PROVIDER_ICONS[selectedModel.provider] || PROVIDER_ICONS.default}
                                alt={selectedModel.provider}
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <span className="text-sm font-medium truncate">{selectedModel.label}</span>
                    </div>
                    <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                        isOpen && "rotate-180"
                    )} />
                </button>
            </div>

            {isOpen && typeof window !== 'undefined' && createPortal(
                <AnimatePresence>
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                            width: dropdownPosition.width,
                            zIndex: 9999
                        }}
                        className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-3 border-b border-border bg-muted/20">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search models..."
                                    autoFocus
                                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                            <div className="py-1">
                                {filteredModels.map((model) => (
                                    <button
                                        key={model.id}
                                        type="button"
                                        onClick={() => handleSelect(model.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-muted/50 transition-all text-left group",
                                            value === model.id && "bg-primary/10 hover:bg-primary/15"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={cn(
                                                "h-9 w-9 rounded-lg flex items-center justify-center p-2 shrink-0 transition-all",
                                                value === model.id ? "bg-primary/20" : "bg-muted group-hover:bg-muted/80"
                                            )}>
                                                <img
                                                    src={PROVIDER_ICONS[model.provider] || PROVIDER_ICONS.default}
                                                    alt={model.provider}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate text-foreground">
                                                    {model.label}
                                                </p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {model.description}
                                                </p>
                                            </div>
                                        </div>
                                        {value === model.id && (
                                            <Check className="h-4 w-4 text-primary shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}

export function AIAssistant({
    isOpen,
    onClose,
    onCreateWorkflow,
    defaultMode = 'help'
}: AIAssistantProps) {
    const [mode, setMode] = useState<AssistantMode>(defaultMode)
    // Separate message histories for each mode
    const [helpMessages, setHelpMessages] = useState<ChatMessage[]>([])
    const [createMessages, setCreateMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [selectedModel, setSelectedModel] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ai_assistant_model') || 'openai/gpt-4o-mini'
        }
        return 'openai/gpt-4o-mini'
    })
    const [selectedCredentialId, setSelectedCredentialId] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ai_assistant_credential') || ''
        }
        return ''
    })
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [isMinimized, setIsMinimized] = useState(false)

    // Persistence Effect
    useEffect(() => {
        if (selectedModel) {
            localStorage.setItem('ai_assistant_model', selectedModel)
        }
    }, [selectedModel])

    useEffect(() => {
        localStorage.setItem('ai_assistant_credential', selectedCredentialId || '')
    }, [selectedCredentialId])

    // Get the current messages based on mode
    const messages = mode === 'help' ? helpMessages : createMessages
    const setMessages = mode === 'help' ? setHelpMessages : setCreateMessages

    // Fetch available models from backend
    const { data: availableModels = AI_MODELS } = useQuery({
        queryKey: ['aiModels', selectedCredentialId],
        queryFn: () => aiApi.getModels(selectedCredentialId || undefined),
        enabled: isOpen,
    })

    // Reset model if it's not in the available list (when credential changes)
    useEffect(() => {
        const currentModelExists = availableModels.find(m => m.id === selectedModel)
        if (!currentModelExists && availableModels.length > 0) {
            setSelectedModel(availableModels[0].id)
        }
    }, [availableModels, selectedModel])

    const chatMutation = useMutation({
        mutationFn: aiApi.chat,
        onSuccess: (data) => {
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, assistantMessage])
            setIsLoading(false)
        },
        onError: () => {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: '❌ Sorry, something went wrong. Please try again or check your settings.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
            setIsLoading(false)
        }
    })

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    useEffect(() => {
        if (isOpen && inputRef.current && !isMinimized && !showSettings) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen, mode, isMinimized, showSettings])

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto'
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
        }
    }, [input])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: ChatMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        if (mode === 'create' && onCreateWorkflow) {
            try {
                // Pass credential_id to ensure the right provider is used
                await onCreateWorkflow(input.trim(), selectedModel, selectedCredentialId || undefined)
                const successMessage: ChatMessage = {
                    role: 'assistant',
                    content: '✨ Workflow created successfully! I\'ve generated the nodes and connections based on your requirements. You can now customize and activate it.',
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, successMessage])
            } catch (error) {
                const errorMessage: ChatMessage = {
                    role: 'assistant',
                    content: '❌ Sorry, failed to create workflow. Please try again.',
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, errorMessage])
            } finally {
                setIsLoading(false)
            }
        } else {
            // Chat Mode
            chatMutation.mutate({
                message: input.trim(),
                model: selectedModel,
                credential_id: selectedCredentialId || undefined,
                history: messages.map(m => ({
                    role: m.role === 'user' ? 'user' : 'assistant', // Map to API types
                    content: m.content
                }))
            })
        }
    }


    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion)
        inputRef.current?.focus()
    }

    const handleCopy = (content: string, index: number) => {
        navigator.clipboard.writeText(content)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    const handleClearChat = () => {
        setMessages([])
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const selectedModelInfo = availableModels.find(m => m.id === selectedModel)

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    height: isMinimized ? 'auto' : '700px'
                }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={cn(
                    "fixed bottom-6 right-6 w-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden",
                    isMinimized && "h-auto"
                )}
            >
                {/* Header */}
                <header className="shrink-0 select-none bg-card border-b border-border">
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {showSettings && (
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                            )}
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-tight text-foreground">
                                    {showSettings ? 'Settings' : 'AI Assistant'}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-[10px] font-medium text-muted-foreground">
                                        {showSettings ? 'Configure AI' : `${mode === 'help' ? 'Help Mode' : 'Create Mode'}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {!showSettings && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => setIsMinimized(!isMinimized)}
                                >
                                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-lg transition-all",
                                    showSettings && "bg-muted text-foreground"
                                )}
                                onClick={() => setShowSettings(!showSettings)}
                            >
                                <Settings2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Mode Switcher - Only show when not in settings */}
                    {!isMinimized && !showSettings && (
                        <div className="px-4 pb-3">
                            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
                                <button
                                    onClick={() => setMode('help')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                                        mode === 'help'
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <HelpCircle className="h-3.5 w-3.5" />
                                    Help & Support
                                </button>
                                <button
                                    onClick={() => setMode('create')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                                        mode === 'create'
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Wand2 className="h-3.5 w-3.5" />
                                    Create Workflow
                                </button>
                            </div>
                        </div>
                    )}
                </header>

                {!isMinimized && (
                    <>
                        {showSettings ? (
                            /* Settings View - Full Dialog */
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Credential Selection (First) */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        AI Credential
                                    </label>
                                    <CredentialSelector
                                        value={selectedCredentialId}
                                        onChange={setSelectedCredentialId}
                                        filterType="ai_provider,google_ai,github_copilot"
                                        placeholder="System Default"
                                    />
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        💡 Connect your own accounts for access to specialized models like Gemini 2.0 or GitHub Copilot.
                                    </p>
                                </div>

                                {/* Model Selection (Second - Dynamic) */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                        <Cpu className="h-4 w-4" /> AI Model
                                    </label>
                                    <ModelSelector
                                        value={selectedModel}
                                        onChange={setSelectedModel}
                                        models={availableModels}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Chat Area */}
                                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
                                    {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-primary/20 to-emerald-400/20 flex items-center justify-center mb-6 shadow-inner"
                                            >
                                                {mode === 'help' ? (
                                                    <MessageSquare className="h-10 w-10 text-primary" />
                                                ) : (
                                                    <Wand2 className="h-10 w-10 text-primary" />
                                                )}
                                            </motion.div>
                                            <h4 className="font-bold text-lg mb-2 tracking-tight">
                                                {mode === 'help' ? 'How can I help you?' : 'Create Your Workflow'}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-6 max-w-[320px] leading-relaxed">
                                                {mode === 'help'
                                                    ? 'Ask me anything about workflows, integrations, or troubleshooting.'
                                                    : 'Describe your automation idea in plain English, and I\'ll build it for you.'}
                                            </p>

                                            {/* Suggestions */}
                                            <div className="w-full space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    {mode === 'help' ? 'Popular Questions' : 'Try These Examples'}
                                                </p>
                                                <div className="space-y-2">
                                                    {mode === 'help' ? (
                                                        HELP_SUGGESTIONS.map((suggestion, i) => (
                                                            <motion.button
                                                                key={i}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.1 }}
                                                                onClick={() => handleSuggestionClick(suggestion.text)}
                                                                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50 hover:bg-background hover:border-primary/50 transition-all text-left group"
                                                            >
                                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                                                    <suggestion.icon className="h-4 w-4 text-primary" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                                                        {suggestion.text}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground">
                                                                        {suggestion.category}
                                                                    </p>
                                                                </div>
                                                            </motion.button>
                                                        ))
                                                    ) : (
                                                        CREATE_SUGGESTIONS.map((suggestion, i) => (
                                                            <motion.button
                                                                key={i}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: i * 0.1 }}
                                                                onClick={() => handleSuggestionClick(suggestion)}
                                                                className="w-full text-left px-3 py-2.5 rounded-lg border border-border bg-background/50 hover:bg-background hover:border-primary/50 text-xs text-foreground transition-all group"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Zap className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                                                    <span className="group-hover:text-primary transition-colors">{suggestion}</span>
                                                                </div>
                                                            </motion.button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((message, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10, x: message.role === 'user' ? 10 : -10 }}
                                            animate={{ opacity: 1, y: 0, x: 0 }}
                                            className={cn(
                                                "flex w-full",
                                                message.role === 'user' ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div className={cn("max-w-[85%] space-y-2")}>
                                                <div
                                                    className={cn(
                                                        "px-4 py-3 rounded-xl text-sm leading-relaxed shadow-sm",
                                                        message.role === 'user'
                                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                            : "bg-muted/50 text-foreground border border-border rounded-tl-sm"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "prose prose-sm max-w-none break-words",
                                                        message.role === 'user'
                                                            ? "prose-invert"
                                                            : "dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
                                                    )}>
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0" {...props} />,
                                                                a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" className="underline font-medium" {...props} />,
                                                                code: ({ node, className, children, ...props }: any) => {
                                                                    const match = /language-(\w+)/.exec(className || '')
                                                                    return !match ? (
                                                                        <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-xs" {...props}>
                                                                            {children}
                                                                        </code>
                                                                    ) : (
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    )
                                                                },
                                                                pre: ({ node, ...props }) => (
                                                                    <div className="not-prose my-2 bg-black/90 text-white rounded-lg overflow-x-auto p-3 text-xs">
                                                                        <pre {...props} />
                                                                    </div>
                                                                )
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "flex items-center gap-2 text-[10px] text-muted-foreground px-1",
                                                    message.role === 'user' ? "justify-end" : "justify-start"
                                                )}>
                                                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {message.role === 'assistant' && (
                                                        <button
                                                            onClick={() => handleCopy(message.content, i)}
                                                            className="hover:text-foreground transition-colors"
                                                        >
                                                            {copiedIndex === i ? (
                                                                <Check className="h-3 w-3" />
                                                            ) : (
                                                                <Copy className="h-3 w-3" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-muted/50 border border-border px-4 py-3 rounded-xl rounded-tl-sm">
                                                <div className="flex gap-1.5">
                                                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="shrink-0 p-4 bg-card border-t border-border">
                                    {messages.length > 0 && (
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                <Cpu className="h-3 w-3" />
                                                <span>{selectedModelInfo?.label}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleClearChat}
                                                className="h-6 text-[10px] gap-1.5"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                Clear Chat
                                            </Button>
                                        </div>
                                    )}
                                    <div className="relative">
                                        <textarea
                                            ref={inputRef}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={mode === 'help' ? "Ask me anything..." : "Describe your workflow..."}
                                            className="w-full min-h-[48px] max-h-[120px] bg-background border border-border rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-muted-foreground transition-all"
                                            rows={1}
                                            disabled={isLoading}
                                        />
                                        <Button
                                            size="icon"
                                            onClick={handleSend}
                                            disabled={!input.trim() || isLoading}
                                            className={cn(
                                                "absolute right-2 bottom-2 h-8 w-8 rounded-lg transition-all",
                                                input.trim() && !isLoading
                                                    ? "opacity-100 scale-100"
                                                    : "opacity-50 scale-90 pointer-events-none"
                                            )}
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-[9px] text-muted-foreground">
                                            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[8px] border border-border">Enter</kbd> to send
                                        </p>
                                        <p className="text-[9px] text-muted-foreground/60 font-medium">
                                            Powered by AI
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
