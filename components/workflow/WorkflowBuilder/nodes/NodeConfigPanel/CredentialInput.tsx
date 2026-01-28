import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
    Plus, Check, X, Loader2, Key, ChevronDown,
    Lock, Link as LinkIcon, HelpCircle,
    ShieldCheck, Globe, Trash2, Edit3, ExternalLink,
    Zap, Info
} from 'lucide-react'
import { API_V1 } from '@/services/api/client'
import { useCredentialsByType, useCreateCredential, useDeleteCredential, credentialKeys } from '@/services/queries/credentials'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { workflowLogger } from '@/lib/logger'

interface Credential {
    id: string
    name: string
    type: string
    data: Record<string, string>
    created_at: string
}

interface CredentialInputProps {
    value: string
    onChange: (value: string) => void
    credentialType: string
    label?: string
}

// Field definition type
interface CredentialField {
    name: string
    label: string
    type: 'text' | 'password' | 'select'
    required?: boolean
    placeholder?: string
    options?: { label: string; value: string }[]
    default?: string
}

interface CredentialDefinition {
    fields: CredentialField[]
    help?: string
}

// Field definitions for manual creation based on type
const CredentialDefinitions: Record<string, CredentialDefinition> = {
    google_sheets: {
        fields: [
            { name: 'client_id', label: 'Client ID', type: 'text', required: true, placeholder: 'Enter your Client ID' },
            { name: 'client_secret', label: 'Client Secret', type: 'password', required: true, placeholder: 'Enter your Client Secret' }
        ],
        help: 'You can find these in your Google Cloud Console under APIs & Services > Credentials.'
    },
    slack: {
        fields: [
            { name: 'client_id', label: 'Client ID', type: 'text', required: true, placeholder: 'Enter your Client ID' },
            { name: 'client_secret', label: 'Client Secret', type: 'password', required: true, placeholder: 'Enter your Client Secret' },
            { name: 'bot_token', label: 'Bot User OAuth Token', type: 'password', required: true, placeholder: 'xoxb-...' },
            { name: 'refresh_token', label: 'Refresh Token (Optional)', type: 'password', placeholder: 'xoxe-...' }
        ],
        help: 'Create a Slack App and look for these in the "Basic Information" and "OAuth & Permissions" sections.'
    },
    discord: {
        fields: [
            { name: 'bot_token', label: 'Discord Bot Token', type: 'password', required: true, placeholder: 'Enter your bot token' }
        ],
        help: 'Generate this token in the Discord Developer Portal under the "Bot" tab of your application.'
    },
    generic: {
        fields: [
            { name: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'Enter your API key' }
        ]
    },
    ai_provider: {
        fields: [
            {
                name: 'provider',
                label: 'Provider',
                type: 'select',
                required: true,
                options: [
                    { label: 'OpenRouter', value: 'openrouter' },
                    { label: 'OpenAI', value: 'openai' },
                    { label: 'Anthropic', value: 'anthropic' },
                    { label: 'Gemini', value: 'gemini' },
                    { label: 'Custom (OpenAI Compatible)', value: 'ai_provider' }
                ],
                default: 'openrouter'
            },
            { name: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'sk-...' },
            { name: 'base_url', label: 'Base URL (Optional)', type: 'text', placeholder: 'https://openrouter.ai/api/v1' }
        ],
        help: 'Provide your AI platform credentials. For OpenRouter, use https://openrouter.ai/api/v1 as Base URL.'
    }
}

export const CredentialInput: React.FC<CredentialInputProps> = ({
    value,
    onChange,
    credentialType,
    label
}) => {
    const queryClient = useQueryClient()
    const { data: credentials = [], isLoading: loading } = useCredentialsByType(credentialType)
    const createCredentialMutation = useCreateCredential()
    const deleteCredentialMutation = useDeleteCredential()

    const [isCreating, setIsCreating] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [createMode, setCreateMode] = useState<'oauth' | 'manual'>('oauth')

    // Form State - will be initialized properly in useEffect
    const [formData, setFormData] = useState<Record<string, string>>({ name: '' })
    const [error, setError] = useState<string | null>(null)

    const isOAuthSupported = ['google_sheets', 'slack', 'discord'].includes(credentialType)
    const definition = CredentialDefinitions[credentialType] || CredentialDefinitions.generic
    const selectedCred = credentials.find(c => c.id === value)

    // Initialize form data with defaults from field definitions
    const getInitialFormData = useCallback(() => {
        const defaults: Record<string, string> = { name: '' }
        definition.fields.forEach((field: CredentialField) => {
            if (field.default) {
                defaults[field.name] = field.default
            }
        })
        return defaults
    }, [definition])

    useEffect(() => {
        if (!isOAuthSupported) setCreateMode('manual')
        else setCreateMode('oauth')
    }, [credentialType, isOAuthSupported])

    // Reset form data when opening create modal
    useEffect(() => {
        if (isCreating) {
            setFormData(getInitialFormData())
            setError(null)
        }
    }, [isCreating, getInitialFormData])

    const handleOAuthSign = () => {
        setError(null)
        const authUrl = `${API_V1}/credentials/oauth/${credentialType}/authorize`
        const width = 600, height = 700
        const left = window.screen.width / 2 - width / 2
        const top = window.screen.height / 2 - height / 2

        const popup = window.open(authUrl, `Connect ${credentialType}`,
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`)

        if (!popup) {
            setError('Popup blocked. Please allow popups.')
            return
        }

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'OAUTH_SUCCESS') {
                const { credentialId } = event.data
                // Invalidate credentials cache to refetch
                queryClient.invalidateQueries({ queryKey: credentialKeys.byType(credentialType) })
                onChange(credentialId)
                setIsCreating(false)
                window.removeEventListener('message', handleMessage)
            }
        }
        window.addEventListener('message', handleMessage)
    }

    const handleCreate = async () => {
        if (!formData.name) {
            setError('Please provide a name for this account')
            return
        }

        setError(null)
        const { name, ...data } = formData
        const payload = {
            name,
            type: credentialType,
            data
        }

        createCredentialMutation.mutate(payload, {
            onSuccess: (newCred) => {
                onChange(newCred.id)
                setIsCreating(false)
                setFormData(getInitialFormData())
            },
            onError: (err) => {
                const message = err instanceof Error ? err.message : 'Failed to create credential'
                setError(message)
            }
        })
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this credential?')) return

        deleteCredentialMutation.mutate(id, {
            onSuccess: () => {
                if (value === id) onChange('')
            },
            onError: (err) => {
                workflowLogger.error('Failed to delete credential', err)
            }
        })
    }

    return (
        <div className="relative w-full">
            {/* Custom Dropdown Trigger */}
            <div className="space-y-1.5">
                <div
                    onClick={() => !isCreating && setIsDropdownOpen(!isDropdownOpen)}
                    className={cn(
                        "group flex items-center justify-between w-full h-10 px-4 bg-muted/20 border border-border rounded-md cursor-pointer transition-all hover:border-primary/50",
                        isDropdownOpen && "ring-1 ring-primary/50 border-primary/50",
                        isCreating && "opacity-50 pointer-events-none"
                    )}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-1 px-1.5 rounded bg-primary/10 text-primary">
                            <Key className="w-3.5 h-3.5" />
                        </div>
                        {selectedCred ? (
                            <span className="text-[11px] font-bold truncate">{selectedCred.name}</span>
                        ) : (
                            <span className="text-[11px] text-muted-foreground/60 font-bold uppercase tracking-widest">Select {label || 'Account'}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {loading && <Loader2 className="w-3 h-3 animate-spin text-primary/50" />}
                        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isDropdownOpen && "rotate-180")} />
                    </div>
                </div>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isDropdownOpen && (
                    <>
                        <div className="fixed inset-0 z-[110]" onClick={() => setIsDropdownOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            className="absolute top-full mt-2 left-0 w-full bg-background border border-border rounded-md shadow-2xl z-[120] overflow-hidden"
                        >
                            <div className="max-h-[240px] overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                                {credentials.length === 0 && !loading && (
                                    <div className="py-8 text-center opacity-30 flex flex-col items-center gap-2">
                                        <ShieldCheck className="w-6 h-6 stroke-1" />
                                        <span className="text-[9px] font-bold uppercase">No Accounts Added</span>
                                    </div>
                                )}

                                {credentials.map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => {
                                            onChange(c.id)
                                            setIsDropdownOpen(false)
                                        }}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2 rounded-sm cursor-pointer transition-all group/item",
                                            value === c.id ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted/50 border border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-1.5 w-1.5 rounded-full", value === c.id ? "bg-primary" : "bg-muted-foreground/30")} />
                                            <span className="text-[10px] font-bold">{c.name}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(c.id, e)}
                                            className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-sm transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="p-1.5 bg-muted/20 border-t border-border mt-1">
                                <button
                                    onClick={() => {
                                        setIsCreating(true)
                                        setIsDropdownOpen(false)
                                    }}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-sm bg-primary/5 hover:bg-primary/10 text-primary transition-all border border-primary/20 border-dashed"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Connect New Account</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Creation Modal / Overlay */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-background/90 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-[500px] bg-background border border-border rounded-lg shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <header className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest leading-none mb-1">New {label || 'Account'}</h3>
                                        <p className="text-[9px] text-muted-foreground/50 uppercase font-bold tracking-tighter">Connection Bridge / {credentialType}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </header>

                            {/* Body */}
                            <div className="p-8 space-y-6">
                                {/* Mode Selector */}
                                {isOAuthSupported && (
                                    <div className="flex p-1 bg-muted/20 border border-border rounded-md shrink-0">
                                        <button
                                            onClick={() => setCreateMode('oauth')}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all",
                                                createMode === 'oauth' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Zap className="w-3 h-3" />
                                            OAuth 2.0
                                        </button>
                                        <button
                                            onClick={() => setCreateMode('manual')}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all",
                                                createMode === 'manual' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            Manual Setup
                                        </button>
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    {createMode === 'oauth' ? (
                                        <motion.div
                                            key="oauth"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="space-y-6"
                                        >
                                            <div className="p-6 rounded-md border border-dashed border-border flex flex-col items-center gap-4 text-center">
                                                <div className="h-16 w-16 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner p-4">
                                                    <img
                                                        src={`/assets/icons/credentials/${credentialType === 'google_sheets' ? 'productivity' :
                                                            ['slack', 'discord'].includes(credentialType) ? 'communication' :
                                                                ['github', 'github_copilot'].includes(credentialType) ? 'development' :
                                                                    ['ai_provider', 'google_ai'].includes(credentialType) ? 'ai' :
                                                                        'integration'
                                                            }/${credentialType}.svg`}
                                                        alt={credentialType}
                                                        className="h-full w-full object-contain"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/assets/icons/credentials/placeholder.svg'
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider">Fast Authentication</h4>
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[280px]">We'll handle the connection securely via {credentialType.replace('_', ' ')}'s official OAuth portal.</p>
                                                </div>
                                                <Button
                                                    onClick={handleOAuthSign}
                                                    className="w-full h-12 rounded-md bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Sign in to {credentialType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="manual"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="space-y-6"
                                        >
                                            {definition.help && (
                                                <div className="p-4 rounded-md bg-amber-500/5 border border-amber-500/10 flex gap-3">
                                                    <Info className="w-4 h-4 text-amber-500 shrink-0" />
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed">{definition.help}</p>
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                {/* Connection Label */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Account Label</label>
                                                    <input
                                                        className="w-full h-11 px-4 bg-muted/20 border border-border rounded-md text-xs focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 font-bold"
                                                        placeholder="e.g. Primary Workspace"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        autoFocus
                                                    />
                                                </div>

                                                {/* Dynamic Fields */}
                                                {definition.fields.map((f: CredentialField) => (
                                                    <div key={f.name} className="space-y-2">
                                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                                            {f.label}
                                                            {f.required && <span className="text-primary ml-1">*</span>}
                                                        </label>
                                                        <div className="relative group/input">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none group-focus-within/input:text-primary transition-colors">
                                                                {f.type === 'password' ? <Lock className="w-3.5 h-3.5" /> : f.type === 'select' ? <Globe className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                                                            </div>
                                                            {f.type === 'select' ? (
                                                                <select
                                                                    className="w-full h-11 pl-10 pr-10 bg-muted/20 border border-border rounded-md text-xs focus:ring-1 focus:ring-primary/50 outline-none transition-all appearance-none font-bold"
                                                                    value={formData[f.name] || f.default || ''}
                                                                    onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                                                                >
                                                                    <option value="" disabled>Select Provider...</option>
                                                                    {f.options?.map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <input
                                                                    type={f.type}
                                                                    className="w-full h-11 pl-10 pr-4 bg-muted/20 border border-border rounded-md text-xs focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/20 font-mono"
                                                                    placeholder={f.placeholder}
                                                                    value={formData[f.name] || ''}
                                                                    onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                                                                />
                                                            )}
                                                            {f.type === 'select' && (
                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none">
                                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {error && (
                                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-bold flex items-center gap-2">
                                        <X className="w-3 h-3" />
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <footer className="px-6 py-5 border-t border-border bg-muted/10 flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsCreating(false)}
                                    className="px-6 h-10 rounded-md text-[10px] font-black uppercase tracking-widest"
                                >
                                    Cancel
                                </Button>
                                {createMode === 'manual' && (
                                    <Button
                                        onClick={handleCreate}
                                        disabled={createCredentialMutation.isPending || !formData.name}
                                        className="px-8 h-10 rounded-md bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        {createCredentialMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                        {createCredentialMutation.isPending ? 'Creating...' : 'Securely Connect'}
                                    </Button>
                                )}
                            </footer>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
