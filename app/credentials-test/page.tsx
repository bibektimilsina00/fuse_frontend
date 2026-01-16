'use client'

import React, { useState } from 'react'
import { useCredentials, useCreateCredential, useDeleteCredential } from '@/services/queries/credentials'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2, Key, Loader2 } from 'lucide-react'

export default function CredentialsTestPage() {
    const { data: credentials = [], isLoading: loading, refetch } = useCredentials()
    const createCredentialMutation = useCreateCredential()
    const deleteCredentialMutation = useDeleteCredential()

    const [newName, setNewName] = useState('')
    const [newType, setNewType] = useState('slack')
    const [newSecret, setNewSecret] = useState('')

    const handleCreate = async () => {
        if (!newName || !newSecret) return

        let secretData: Record<string, string> = { value: newSecret }
        try {
            const parsed = JSON.parse(newSecret)
            // Ensure all values are strings
            secretData = Object.fromEntries(
                Object.entries(parsed).map(([k, v]) => [k, String(v)])
            )
        } catch {
            secretData = { value: newSecret }
        }

        createCredentialMutation.mutate(
            {
                name: newName,
                type: newType,
                data: secretData
            },
            {
                onSuccess: () => {
                    setNewName('')
                    setNewSecret('')
                },
                onError: (error) => {
                    console.error('Failed to create credential:', error)
                    alert('Failed to create credential')
                }
            }
        )
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this credential?')) return

        deleteCredentialMutation.mutate(id, {
            onError: (error) => {
                console.error('Failed to delete credential:', error)
            }
        })
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Credentials Test</h1>
                        <p className="text-muted-foreground">Manage your service connections</p>
                    </div>
                    <Button onClick={() => refetch()} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                    </Button>
                </div>

                {/* Create New Credential */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add New Credential
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="My Slack Workspace"
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Type</label>
                            <select
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                            >
                                <option value="slack">Slack</option>
                                <option value="discord">Discord</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="google_sheets">Google Sheets</option>
                                <option value="generic">Generic</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Secret / API Key / Webhook URL</label>
                        <textarea
                            value={newSecret}
                            onChange={(e) => setNewSecret(e.target.value)}
                            placeholder="Paste your API key, webhook URL, or JSON credentials here..."
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg font-mono text-sm h-24"
                        />
                    </div>

                    <Button onClick={handleCreate} disabled={createCredentialMutation.isPending || !newName || !newSecret}>
                        {createCredentialMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        Create Credential
                    </Button>
                </div>

                {/* Credentials List */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Saved Credentials ({credentials.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : credentials.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No credentials found. Create one above to get started.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {credentials.map((cred) => (
                                <div
                                    key={cred.id}
                                    className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:border-primary/40 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="font-semibold">{cred.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Type: {cred.type} • Created: {new Date(cred.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                                            ID: {cred.id}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(cred.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
