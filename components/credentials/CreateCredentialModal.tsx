'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2, Search, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { credentialsApi } from '@/services/api/credentials'
import { cn } from '@/lib/utils'

interface CreateCredentialModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (credentialId: string) => void
    defaultType?: string
}

// Available apps/services for credentials
const CREDENTIAL_APPS = [
    {
        id: 'ai_provider',
        name: 'AI Provider',
        icon: '🤖',
        description: 'OpenAI, Anthropic, Gemini, etc.',
        category: 'AI & ML',
        providers: [
            { id: 'openai', label: 'OpenAI', icon: '🤖', needsBaseUrl: true },
            { id: 'anthropic', label: 'Anthropic', icon: '🧠', needsBaseUrl: false },
            { id: 'gemini', label: 'Google Gemini', icon: '💎', needsBaseUrl: false },
            { id: 'openrouter', label: 'OpenRouter', icon: '🚀', needsBaseUrl: true },
        ]
    },
    {
        id: 'google_ai',
        name: 'Google AI / Gemini',
        icon: '💎',
        description: 'Premium Antigravity Models (OAuth)',
        category: 'AI & ML',
        isOAuth: true
    },
    {
        id: 'github_copilot',
        name: 'GitHub Copilot',
        icon: '🤖',
        description: 'Login with GitHub Copilot',
        category: 'AI & ML',
        isOAuth: true
    },
    {
        id: 'google_sheets',
        name: 'Google Sheets',
        icon: '📊',
        description: 'Spreadsheet automation',
        category: 'Productivity',
        isOAuth: true
    },
    {
        id: 'slack',
        name: 'Slack',
        icon: '💬',
        description: 'Team communication',
        category: 'Communication',
        isOAuth: true
    },
    {
        id: 'discord',
        name: 'Discord',
        icon: '🎮',
        description: 'Community platform',
        category: 'Communication',
        isOAuth: true
    },
    {
        id: 'github',
        name: 'GitHub',
        icon: '🐙',
        description: 'Code repository',
        category: 'Development',
        isOAuth: true
    },
    {
        id: 'webhook',
        name: 'Webhook',
        icon: '🔗',
        description: 'HTTP webhooks',
        category: 'Integration'
    },
    {
        id: 'api_key',
        name: 'Generic API Key',
        icon: '🔑',
        description: 'Any API key',
        category: 'Integration'
    },
    {
        id: 'database',
        name: 'Database',
        icon: '🗄️',
        description: 'SQL/NoSQL databases',
        category: 'Data'
    },
]

export function CreateCredentialModal({ isOpen, onClose, onSuccess, defaultType }: CreateCredentialModalProps) {
    const queryClient = useQueryClient()
    const [step, setStep] = useState<'select-app' | 'configure' | 'device-flow'>('select-app')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedApp, setSelectedApp] = useState<typeof CREDENTIAL_APPS[0] | null>(null)
    const [deviceCodeData, setDeviceCodeData] = useState<{ user_code: string; verification_uri: string; device_code: string; interval: number } | null>(null)
    const [copied, setCopied] = useState(false)

    // Form fields
    const [name, setName] = useState('')
    const [provider, setProvider] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [baseUrl, setBaseUrl] = useState('')

    const createMutation = useMutation({
        mutationFn: (data: { name: string; type: string; data: Record<string, string> }) =>
            credentialsApi.createCredential(data),
        onSuccess: (newCredential) => {
            queryClient.invalidateQueries({ queryKey: ['credentials'] })
            if (onSuccess) {
                onSuccess(newCredential.id)
            }
            handleClose()
        }
    })

    // Prepare Device Flow Logic
    const startDeviceFlowMutation = useMutation({
        mutationFn: () => credentialsApi.initiateGitHubCopilotDeviceFlow(),
        onSuccess: (data) => {
            setDeviceCodeData(data)
            setStep('device-flow')
        },
        onError: (err) => {
            alert("Failed to start device flow: " + err)
        }
    })

    // Polling Effect
    useEffect(() => {
        if (step !== 'device-flow' || !deviceCodeData) return;

        const intervalId = setInterval(async () => {
            try {
                const res = await credentialsApi.pollGitHubCopilot(deviceCodeData.device_code)
                if (res.status === 'success' && res.credential) {
                    queryClient.invalidateQueries({ queryKey: ['credentials'] })
                    if (onSuccess && res.credential) onSuccess(res.credential.id)
                    handleClose()
                }
            } catch (e) {
                // Ignore pending/slow_down errors
            }
        }, (deviceCodeData.interval || 5) * 1000);

        return () => clearInterval(intervalId);
    }, [step, deviceCodeData, queryClient, onSuccess])

    const handleClose = () => {
        setStep('select-app')
        setSearchQuery('')
        setSelectedApp(null)
        setDeviceCodeData(null)
        setName('')
        setApiKey('')
        setBaseUrl('')
        setProvider('')
        onClose()
    }

    const handleSelectApp = (app: typeof CREDENTIAL_APPS[0]) => {
        setSelectedApp(app)
        if (app.providers && app.providers.length > 0) {
            setProvider(app.providers[0].id)
        }
        setStep('configure')
    }

    const copyCode = () => {
        if (deviceCodeData?.user_code) {
            navigator.clipboard.writeText(deviceCodeData.user_code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedApp) return

        if (selectedApp.id === 'github_copilot') {
            startDeviceFlowMutation.mutate()
            return
        }

        if (selectedApp.isOAuth) {
            // Redirect to Backend OAuth
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5678'
            // Construct API V1 URL if not included
            const baseUrl = API_BASE.endsWith('/api/v1') ? API_BASE : `${API_BASE}/api/v1`
            window.location.href = `${baseUrl}/credentials/oauth/${selectedApp.id}/authorize`
            return
        }

        createMutation.mutate({
            name,
            type: selectedApp.id,
            data: {
                api_key: apiKey,
                ...(selectedApp.id === 'ai_provider' && { provider }),
                ...(baseUrl && { base_url: baseUrl })
            }
        })
    }

    const filteredApps = CREDENTIAL_APPS.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const categories = Array.from(new Set(CREDENTIAL_APPS.map(app => app.category)))

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {step === 'select-app' ? 'Select App' :
                                step === 'device-flow' ? 'Connect GitHub Copilot' :
                                    `Create ${selectedApp?.name} Credential`}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {step === 'select-app'
                                ? 'Choose the service you want to connect'
                                : step === 'device-flow' ? 'Authorize the application on GitHub'
                                    : 'Enter your credentials to connect'}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {step === 'select-app' ? (
                        <div className="p-6 space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search apps..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    autoFocus
                                />
                            </div>

                            {/* Apps Grid */}
                            <div className="space-y-6">
                                {categories.map(category => {
                                    const categoryApps = filteredApps.filter(app => app.category === category)
                                    if (categoryApps.length === 0) return null

                                    return (
                                        <div key={category}>
                                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                                {category}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {categoryApps.map(app => (
                                                    <button
                                                        key={app.id}
                                                        onClick={() => handleSelectApp(app)}
                                                        className="flex items-start gap-3 p-4 bg-background border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
                                                    >
                                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                                                            {app.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h4 className="font-medium text-sm truncate">{app.name}</h4>
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                                {app.description}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {filteredApps.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No apps found</p>
                                </div>
                            )}
                        </div>
                    ) : step === 'device-flow' && deviceCodeData ? (
                        <div className="p-6 space-y-6 flex flex-col items-center text-center">
                            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 w-full max-w-sm">
                                <p className="text-sm text-muted-foreground mb-2">Device Code</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-2xl font-mono font-bold tracking-wider text-primary bg-background py-3 rounded-lg border border-border">
                                        {deviceCodeData.user_code}
                                    </code>
                                    <Button size="icon" variant="outline" className="h-14 w-14" onClick={copyCode}>
                                        {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 max-w-sm">
                                <p className="text-muted-foreground">
                                    1. Copy the code above.<br />
                                    2. Click the button below to open GitHub.<br />
                                    3. Paste the code to authorize specific access.
                                </p>

                                <a
                                    href={deviceCodeData.verification_uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full"
                                >
                                    <Button className="w-full gap-2" size="lg">
                                        Open GitHub Authorization
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </a>

                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Waiting for authorization...
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Back button */}
                            <button
                                type="button"
                                onClick={() => setStep('select-app')}
                                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 -ml-1"
                            >
                                <ChevronRight className="h-4 w-4 rotate-180" />
                                Back to app selection
                            </button>

                            {/* Credential Name */}
                            {!selectedApp?.isOAuth && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                                        Credential Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder={`My ${selectedApp?.name} Account`}
                                        required
                                    />
                                </div>
                            )}

                            {/* AI Provider Selection */}
                            {selectedApp?.id === 'ai_provider' && selectedApp.providers && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                                        Provider
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedApp.providers.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setProvider(p.id)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
                                                    provider === p.id
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border bg-background hover:border-primary/50"
                                                )}
                                            >
                                                <span>{p.icon}</span>
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* OAuth Notice */}
                            {selectedApp?.isOAuth && (
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                    <p className="text-sm text-foreground">
                                        <strong>Connection Required:</strong> You will be redirected to {selectedApp.name} to authorize access.
                                    </p>
                                </div>
                            )}

                            {/* API Key / Webhook URL */}
                            {!selectedApp?.isOAuth && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                                        {selectedApp?.id === 'webhook' ? 'Webhook URL' : 'API Key / Token'}
                                    </label>
                                    <input
                                        type={selectedApp?.id === 'webhook' ? 'text' : 'password'}
                                        value={apiKey}
                                        onChange={e => setApiKey(e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono text-sm"
                                        placeholder={selectedApp?.id === 'webhook' ? 'https://hooks.example.com/...' : 'sk-...'}
                                        required
                                    />
                                </div>
                            )}

                            {/* Base URL (for AI providers that support it) */}
                            {selectedApp?.id === 'ai_provider' && selectedApp.providers?.find(p => p.id === provider)?.needsBaseUrl && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                                        Base URL (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={baseUrl}
                                        onChange={e => setBaseUrl(e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder={provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1'}
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => setStep('select-app')}>
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={(!selectedApp?.isOAuth && !name) || (!selectedApp?.isOAuth && !apiKey) || createMutation.isPending || startDeviceFlowMutation.isPending}
                                >
                                    {createMutation.isPending || startDeviceFlowMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {selectedApp?.isOAuth ? 'Connecting...' : 'Creating...'}
                                        </>
                                    ) : (
                                        selectedApp?.isOAuth ? 'Connect' : 'Create'
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
