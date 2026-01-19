'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Search, Plus, Key, Check, Sparkles } from 'lucide-react'
import { credentialsApi, Credential } from '@/services/api/credentials'
import { CreateCredentialModal } from './CreateCredentialModal'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

interface CredentialSelectorProps {
    value?: string
    onChange: (credentialId: string) => void
    filterType?: string
    placeholder?: string
    className?: string
}

const CREDENTIAL_ICONS: Record<string, string> = {
    google_sheets: '📊',
    slack: '💬',
    discord: '🎮',
    ai_provider: '🤖',
    webhook: '🔗',
    api_key: '🔑',
    database: '🗄️',
    github: '🐙',
    default: '🔐'
}

export function CredentialSelector({ value, onChange, filterType, placeholder = 'Select credential', className }: CredentialSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    const triggerRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const { data: credentials = [], isLoading } = useQuery({
        queryKey: ['credentials'],
        queryFn: () => credentialsApi.getCredentials()
    })

    const filteredCredentials = credentials.filter((cred: Credential) => {
        const matchesType = !filterType || filterType.split(',').includes(cred.type)
        const matchesSearch = cred.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
    })

    const selectedCredential = credentials.find((c: Credential) => c.id === value)

    // Update dropdown position when opened
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

    // Close dropdown when clicking outside
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

    const handleSelect = (credentialId: string) => {
        onChange(credentialId)
        setIsOpen(false)
        setSearchQuery('')
    }

    const handleCreateSuccess = (newCredentialId: string) => {
        onChange(newCredentialId)
        setShowCreateModal(false)
        setIsOpen(false)
    }

    return (
        <>
            <div className={cn("relative", className)}>
                {/* Trigger Button */}
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
                        {selectedCredential ? (
                            <>
                                <span className="text-base shrink-0">
                                    {CREDENTIAL_ICONS[selectedCredential.type] || CREDENTIAL_ICONS.default}
                                </span>
                                <span className="text-sm font-medium truncate">{selectedCredential.name}</span>
                            </>
                        ) : (
                            <>
                                <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm text-muted-foreground truncate">{placeholder}</span>
                            </>
                        )}
                    </div>
                    <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                        isOpen && "rotate-180"
                    )} />
                </button>
            </div>

            {/* Dropdown Portal */}
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
                        {/* Search */}
                        <div className="p-3 border-b border-border bg-muted/20">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search credentials..."
                                    autoFocus
                                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {/* Credentials List */}
                        <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="p-8 text-center">
                                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        Loading...
                                    </div>
                                </div>
                            ) : filteredCredentials.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                        <Key className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        {searchQuery ? 'No credentials found' : 'No credentials yet'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {searchQuery ? 'Try a different search' : 'Create your first credential below'}
                                    </p>
                                </div>
                            ) : (
                                <div className="py-1">
                                    {filteredCredentials.map((credential: Credential) => (
                                        <button
                                            key={credential.id}
                                            type="button"
                                            onClick={() => handleSelect(credential.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-muted/50 transition-all text-left group",
                                                value === credential.id && "bg-primary/10 hover:bg-primary/15"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className={cn(
                                                    "h-9 w-9 rounded-lg flex items-center justify-center text-lg shrink-0 transition-all",
                                                    value === credential.id ? "bg-primary/20" : "bg-muted group-hover:bg-muted/80"
                                                )}>
                                                    {CREDENTIAL_ICONS[credential.type] || CREDENTIAL_ICONS.default}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate text-foreground">
                                                        {credential.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {credential.type.replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                            {value === credential.id && (
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Create New Button */}
                        <div className="p-2 border-t border-border bg-gradient-to-b from-transparent to-muted/30">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateModal(true)
                                    setIsOpen(false)
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all text-sm font-medium group"
                            >
                                <div className="h-5 w-5 rounded-md bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center transition-all">
                                    <Plus className="h-3.5 w-3.5" />
                                </div>
                                Create new credential
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}

            {/* Create Credential Modal */}
            <CreateCredentialModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
                defaultType={filterType ? filterType.split(',')[0] : 'api_key'}
            />
        </>
    )
}
