'use client'

import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bot, Sparkles, Send, MessageSquare, Ghost } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ChatMessage {
    role: 'user' | 'ai'
    message: string
}

interface AIChatPopupProps {
    isOpen: boolean
    onClose: () => void
    messages: ChatMessage[]
    isLoading: boolean
    input: string
    onInputChange: (value: string) => void
    onSend: () => void
}

export function AIChatPopup({
    isOpen,
    onClose,
    messages,
    isLoading,
    input,
    onInputChange,
    onSend
}: AIChatPopupProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute bottom-6 right-6 w-[400px] h-[550px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-[100] overflow-hidden"
                >
                    {/* Header */}
                    <header className="p-5 flex items-center justify-between border-b border-border bg-muted/30 shrink-0 select-none">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-gradient-to-tr from-indigo-500 via-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/20 animate-gradient-xy">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-tight text-foreground">AI Architect</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Neural Engine Active</p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md hover:bg-white/10 transition-colors"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </header>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mb-6 shadow-inner"
                                >
                                    <Ghost className="h-8 w-8 text-primary/40" />
                                </motion.div>
                                <h4 className="font-bold text-base mb-2 tracking-tight">I'm your Workflow Assistant</h4>
                                <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed opacity-60">
                                    "Create a workflow that sends Slack alerts when my website goes down"
                                </p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10, y: 5 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                key={i}
                                className={cn(
                                    "flex w-full",
                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[85%] px-4 py-3 rounded-md text-xs leading-relaxed font-medium shadow-lg transition-all",
                                        msg.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-tr-none shadow-primary/10"
                                            : "bg-white/5 text-foreground border border-white/5 rounded-tl-none backdrop-blur-sm"
                                    )}
                                >
                                    {msg.message}
                                </div>
                            </motion.div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-md rounded-tl-none">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 pt-2 shrink-0">
                        <div className="relative flex items-center group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => onInputChange(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
                                placeholder="Command your workflow..."
                                className="w-full bg-white/5 border border-white/5 rounded-md pl-5 pr-14 py-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/10 transition-all shadow-inner placeholder:text-muted-foreground/30 font-bold tracking-tight"
                                autoFocus
                            />
                            <div className="absolute right-2 flex items-center gap-1.5">
                                <Button
                                    size="icon"
                                    onClick={onSend}
                                    disabled={!input.trim() || isLoading}
                                    className={cn(
                                        "h-9 w-9 rounded-md transition-all shadow-lg",
                                        input.trim()
                                            ? "opacity-100 scale-100 bg-primary shadow-primary/20"
                                            : "opacity-0 scale-90 pointer-events-none"
                                    )}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="mt-4 text-[9px] text-center text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">
                            Alpha Neural Interface 1.0
                        </p>
                    </div>

                    {/* Background Accents */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-primary to-emerald-400 opacity-60" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
