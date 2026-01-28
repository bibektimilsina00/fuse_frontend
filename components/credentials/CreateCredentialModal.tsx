'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Loader2, Search, ChevronRight, Copy, Check, ExternalLink, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { credentialsApi, Credential } from '@/services/api/credentials'
import { pluginsApi } from '@/services/api/plugins'
import { cn } from '@/lib/utils'

interface CreateCredentialModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (credentialId: string) => void
    defaultType?: string
    initialData?: Credential | null
}

// Available apps/services for credentials
const CREDENTIAL_APPS = [
    {
        id: 'ai_provider',
        name: 'AI Provider',
        iconPath: '/assets/icons/credentials/ai/ai_provider.svg',
        description: 'OpenAI, Anthropic, Gemini, etc.',
        category: 'AI & ML',
        providers: [
            { id: 'openai', label: 'OpenAI', iconPath: '/assets/icons/credentials/ai/openai.svg', needsBaseUrl: true },
            { id: 'anthropic', label: 'Anthropic', iconPath: '/assets/icons/credentials/ai/anthropic.svg', needsBaseUrl: false },
            { id: 'gemini', label: 'Google Gemini', iconPath: '/assets/icons/credentials/ai/gemini.svg', needsBaseUrl: false },
            { id: 'openrouter', label: 'OpenRouter', iconPath: '/assets/icons/credentials/ai/openrouter.svg', needsBaseUrl: true },
        ]
    },
    {
        id: 'google_ai',
        name: 'Google AI / Gemini',
        iconPath: '/assets/icons/credentials/ai/google_ai.svg',
        description: 'Premium Antigravity Models (OAuth)',
        category: 'AI & ML',
        isOAuth: true
    },
    {
        id: 'github_copilot',
        name: 'GitHub Copilot',
        iconPath: '/assets/icons/credentials/development/github_copilot.svg',
        description: 'Login with GitHub Copilot',
        category: 'AI & ML',
        isOAuth: true
    },
    {
        id: 'google_sheets',
        name: 'Google Sheets',
        iconPath: '/assets/icons/credentials/productivity/google_sheets.svg',
        description: 'Spreadsheet automation',
        category: 'Productivity',
        isOAuth: true
    },
    {
        id: 'slack',
        name: 'Slack',
        iconPath: '/assets/icons/credentials/communication/slack.svg',
        description: 'Team communication',
        category: 'Communication',
        isOAuth: true
    },
    {
        id: 'discord',
        name: 'Discord',
        iconPath: '/assets/icons/credentials/communication/discord.svg',
        description: 'Community platform',
        category: 'Communication',
        isOAuth: true
    },
    {
        id: 'github',
        name: 'GitHub',
        iconPath: '/assets/icons/credentials/development/github.svg',
        description: 'Code repository',
        category: 'Development',
        isOAuth: true
    },
    {
        id: 'webhook',
        name: 'Webhook',
        iconPath: '/assets/icons/credentials/integration/webhook.svg',
        description: 'HTTP webhooks',
        category: 'Integration'
    },
    {
        id: 'api_key',
        name: 'Generic API Key',
        iconPath: '/assets/icons/credentials/integration/api_key.svg',
        description: 'Any API key',
        category: 'Integration'
    },
    {
        id: 'database',
        name: 'Database',
        iconPath: '/assets/icons/credentials/data/database.svg',
        description: 'SQL/NoSQL databases',
        category: 'Data'
    },
]

export function CreateCredentialModal({ isOpen, onClose, onSuccess, defaultType, initialData }: CreateCredentialModalProps) {
    const queryClient = useQueryClient()
    const [step, setStep] = useState<'select-app' | 'configure' | 'device-flow'>('select-app')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedApp, setSelectedApp] = useState<typeof CREDENTIAL_APPS[0] | null>(null)
    const [deviceCodeData, setDeviceCodeData] = useState<{ user_code: string; verification_uri: string; device_code: string; interval: number } | null>(null)
    const [copied, setCopied] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)

    // Form fields
    const [name, setName] = useState('')
    const [provider, setProvider] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [baseUrl, setBaseUrl] = useState('')

    // Initialize/Reset Effect
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const app = CREDENTIAL_APPS.find(a => a.id === initialData.type)
                setSelectedApp(app || null)
                setName(initialData.name)
                // Map data fields based on type
                const data = initialData.data || {}
                if (initialData.type === 'ai_provider') {
                    setProvider(data.provider || '')
                    setApiKey(data.api_key || '')
                    setBaseUrl(data.base_url || '')
                } else if (initialData.type === 'webhook') {
                    setApiKey(data.webhook_url || '')
                    setBaseUrl(data.webhook_url || '')
                } else {
                    setApiKey(data.api_key || data.token || '')
                }
                setStep('configure')
            } else if (defaultType) {
                const app = CREDENTIAL_APPS.find(a => a.id === defaultType)
                if (app) handleSelectApp(app)
            }
        } else {
            // Reset on close handled in handleClose
        }
    }, [isOpen, initialData, defaultType])

    // Plugin Status Check
    const { data: plugin, refetch: refetchPlugin } = useQuery({
        queryKey: ['plugin', 'google-ai-antigravity'],
        queryFn: () => pluginsApi.getPlugin('google-ai-antigravity'),
        enabled: selectedApp?.id === 'google_ai',
        refetchInterval: selectedApp?.id === 'google_ai' ? 2000 : false
    })

    const installPluginMutation = useMutation({
        mutationFn: () => pluginsApi.performAction('google-ai-antigravity', 'install'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plugin', 'google-ai-antigravity'] })
        }
    })

    const startPluginMutation = useMutation({
        mutationFn: () => pluginsApi.performAction('google-ai-antigravity', 'start'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plugin', 'google-ai-antigravity'] })
        }
    })

    // Prepare actions
    const handlePluginInstall = (e: React.MouseEvent) => {
        e.preventDefault()
        installPluginMutation.mutate()
    }

    const handlePluginStart = (e: React.MouseEvent) => {
        e.preventDefault()
        startPluginMutation.mutate()
    }

    // Check if we are blocked by plugin
    const isPluginReady = selectedApp?.id !== 'google_ai' || (plugin?.installed && plugin?.running)
    const isPluginInstalling = installPluginMutation.isPending || startPluginMutation.isPending

    // CREDENTIAL CREATION GENERIC
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

    const updateMutation = useMutation({
        mutationFn: (data: { id: string; name: string; data: Record<string, string> }) =>
            credentialsApi.updateCredential(data.id, { name: data.name, data: data.data }),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['credentials'] })
            if (onSuccess) {
                onSuccess(updated.id)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedApp) return

        if (selectedApp.id === 'google_ai' && !isPluginReady) {
            return
        }

        if (selectedApp.id === 'github_copilot' && !initialData) {
            startDeviceFlowMutation.mutate()
            return
        }

        if (selectedApp.isOAuth && !initialData) {
            try {
                setIsConnecting(true)
                const res = await credentialsApi.getOAuthUrl(selectedApp.id)
                if (res.url) {
                    window.location.href = res.url
                } else {
                    console.error("No URL returned for OAuth")
                    setIsConnecting(false)
                }
            } catch (err) {
                console.error("Failed to initiate OAuth:", err)
                setIsConnecting(false)
                alert("Failed to connect: " + (err instanceof Error ? err.message : String(err)))
            }
            return
        }

        const payload = {
            name,
            type: selectedApp.id,
            data: {
                api_key: apiKey,
                ...(selectedApp.id === 'ai_provider' && { provider }),
                ...(baseUrl && { base_url: baseUrl }),
                ...(selectedApp.id === 'webhook' && { webhook_url: apiKey })
            }
        }

        if (initialData) {
            updateMutation.mutate({ id: initialData.id, ...payload })
        } else {
            createMutation.mutate(payload)
        }
    }

    // Polling Effect
    useEffect(() => {
        if (step !== 'device-flow' || !deviceCodeData) return;

        let timeoutId: NodeJS.Timeout;
        let isCancelled = false;

        const poll = async () => {
            if (isCancelled) return;

            try {
                const res = await credentialsApi.pollGitHubCopilot(deviceCodeData.device_code)

                if (res.status === 'success' && res.credential) {
                    queryClient.invalidateQueries({ queryKey: ['credentials'] })
                    if (onSuccess && res.credential) onSuccess(res.credential.id)
                    handleClose()
                    return
                }

                // Continue polling with dynamic interval (add 2s buffer for safety)
                const nextInterval = ((res.interval || deviceCodeData.interval || 5) + 2) * 1000;
                timeoutId = setTimeout(poll, nextInterval)
            } catch (e) {
                // On error, wait 10s and retry
                if (!isCancelled) timeoutId = setTimeout(poll, 10000)
            }
        }

        // Start polling loop
        timeoutId = setTimeout(poll, (deviceCodeData.interval || 5) * 1000)

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        }
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
                            {initialData ? `Edit ${selectedApp?.name} Credential` :
                                step === 'select-app' ? 'Select App' :
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
                                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center p-2 shrink-0">
                                                            <img src={app.iconPath} alt={app.name} className="h-full w-full object-contain" />
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
                            {!initialData && (
                                <button
                                    type="button"
                                    onClick={() => setStep('select-app')}
                                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 -ml-1"
                                >
                                    <ChevronRight className="h-4 w-4 rotate-180" />
                                    Back to app selection
                                </button>
                            )}

                            {/* Credential Name */}
                            {(initialData || !selectedApp?.isOAuth) && (
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
                                                <img src={p.iconPath} alt={p.label} className="h-5 w-5 object-contain" />
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* OAuth Notice */}
                            {selectedApp?.isOAuth && !initialData && (
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                    <p className="text-sm text-foreground">
                                        <strong>Connection Required:</strong> You will be redirected to {selectedApp.name} to authorize access.
                                    </p>
                                </div>
                            )}

                            {/* Google AI Plugin Notice */}
                            {selectedApp?.id === 'google_ai' && !initialData && (
                                <div className={cn(
                                    "border rounded-lg p-4 mt-4 transition-colors",
                                    isPluginReady ? "bg-green-500/10 border-green-500/20" : "bg-amber-500/10 border-amber-500/20"
                                )}>
                                    <div className="flex items-start gap-3">
                                        <div className="text-xl pt-0.5">
                                            {isPluginReady ? '✅' : 'ℹ️'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={cn("text-sm font-medium", isPluginReady ? "text-green-600" : "text-amber-500")}>
                                                {isPluginReady ? "Plugin Ready" : "Plugin Required"}
                                            </h4>

                                            {!isPluginReady && (
                                                <div className="mt-2 space-y-3">
                                                    <p className="text-xs text-muted-foreground">
                                                        The <strong>Google AI / Antigravity</strong> plugin is required to use this credential.
                                                    </p>

                                                    {!plugin?.installed ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={handlePluginInstall}
                                                            disabled={isPluginInstalling}
                                                            className="w-full gap-2"
                                                        >
                                                            {isPluginInstalling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                                            Install Plugin
                                                        </Button>
                                                    ) : !plugin?.running ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={handlePluginStart}
                                                            disabled={isPluginInstalling}
                                                            className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            {isPluginInstalling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                            Start Plugin Service
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* API Key / Webhook URL */}
                            {(initialData || !selectedApp?.isOAuth) && (
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
                                {!initialData && (
                                    <Button type="button" variant="outline" onClick={() => setStep('select-app')}>
                                        Back
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={
                                        (!selectedApp?.isOAuth && !name) ||
                                        (!selectedApp?.isOAuth && !apiKey) ||
                                        createMutation.isPending ||
                                        updateMutation.isPending ||
                                        startDeviceFlowMutation.isPending ||
                                        isConnecting ||
                                        (selectedApp?.id === 'google_ai' && !isPluginReady)
                                    }
                                >
                                    {createMutation.isPending || updateMutation.isPending || startDeviceFlowMutation.isPending || isConnecting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {selectedApp?.isOAuth ? 'Connecting...' : initialData ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        selectedApp?.isOAuth && !initialData ? 'Connect' : initialData ? 'Update' : 'Create'
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
