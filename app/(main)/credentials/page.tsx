'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
    Key,
    Plus,
    MoreHorizontal,
    Search,
    Trash2,
    Edit2,
    Shield,
    Clock,
    Filter
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { credentialsApi, Credential } from '@/services/api/credentials'
import { CreateCredentialModal } from '@/components/credentials'
import { cn } from '@/lib/utils'

// Credential type icons and colors
const CREDENTIAL_TYPES: Record<string, { icon: string; color: string; label: string }> = {
    google_sheets: { icon: '📊', color: 'bg-green-500/20 text-green-400', label: 'Google Sheets' },
    google_ai: { icon: '💎', color: 'bg-blue-500/20 text-blue-400', label: 'Google AI' },
    github_copilot: { icon: '🤖', color: 'bg-indigo-500/20 text-indigo-100', label: 'GitHub Copilot' },
    slack: { icon: '💬', color: 'bg-purple-500/20 text-purple-400', label: 'Slack' },
    discord: { icon: '🎮', color: 'bg-indigo-500/20 text-indigo-400', label: 'Discord' },
    ai_provider: { icon: '🤖', color: 'bg-cyan-500/20 text-cyan-400', label: 'AI Provider' },
    webhook: { icon: '🔗', color: 'bg-orange-500/20 text-orange-400', label: 'Webhook' },
    api_key: { icon: '🔑', color: 'bg-amber-500/20 text-amber-400', label: 'API Key' },
    database: { icon: '🗄️', color: 'bg-blue-500/20 text-blue-400', label: 'Database' },
    github: { icon: '🐙', color: 'bg-gray-500/20 text-gray-400', label: 'GitHub' },
    default: { icon: '🔐', color: 'bg-gray-500/20 text-gray-400', label: 'Custom' }
}

function getCredentialType(type: string) {
    return CREDENTIAL_TYPES[type] || CREDENTIAL_TYPES.default
}

function CredentialCard({ credential, onDelete }: { credential: Credential; onDelete: (id: string) => void }) {
    const [showMenu, setShowMenu] = useState(false)
    const typeInfo = getCredentialType(credential.type)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-lg", typeInfo.color)}>
                        {typeInfo.icon}
                    </div>
                    <div>
                        <h3 className="font-medium text-foreground">{credential.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{typeInfo.label}</p>
                    </div>
                </div>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                    onDelete(credential.id)
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
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Created {new Date(credential.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-green-500" />
                    Encrypted
                </div>
            </div>
        </motion.div>
    )
}

export default function CredentialsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const queryClient = useQueryClient()

    const { data: credentials = [], isLoading } = useQuery({
        queryKey: ['credentials'],
        queryFn: () => credentialsApi.getCredentials()
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => credentialsApi.deleteCredential(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['credentials'] })
        }
    })

    const filteredCredentials = credentials.filter(cred =>
        cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cred.type.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Credentials</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage your API keys, tokens, and OAuth connections
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Credential
                </Button>
            </div>


            {/* Search & Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search credentials..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="search-input w-full !pl-9"
                    />
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Credentials Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-muted" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-24 bg-muted rounded" />
                                    <div className="h-3 w-16 bg-muted rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredCredentials.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Key className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No credentials yet</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                        Add your first credential to connect external services to your workflows
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Credential
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCredentials.map(credential => (
                        <CredentialCard
                            key={credential.id}
                            credential={credential}
                            onDelete={id => deleteMutation.mutate(id)}
                        />
                    ))}
                </div>
            )}

            <CreateCredentialModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    )
}
