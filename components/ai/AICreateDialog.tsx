'use client'

import * as React from 'react'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/Dialog'
import { Button } from '../ui/Button'
import { cn } from '@/lib/utils'

import { useAIDialog } from '@/hooks/use-ai-dialog'

interface AICreateDialogProps {
    trigger?: React.ReactNode
    title?: string
    description?: string
    placeholder?: string
    onSubmit?: (prompt: string) => void | Promise<void>
    className?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AICreateDialog({
    trigger,
    title = 'Create Workflow with AI',
    description = 'Describe your automation workflow and AI will generate it for you.',
    placeholder = 'E.g., "When I receive a WhatsApp message, extract the order details and add them to Google Sheets"',
    onSubmit,
    className,
    open: controlledOpen,
    onOpenChange,
}: AICreateDialogProps) {
    const {
        open,
        setOpen,
        prompt,
        setPrompt,
        isLoading,
        handleSubmit,
        handleKeyDown,
        setSuggestion
    } = useAIDialog({
        onSubmit,
        open: controlledOpen,
        onOpenChange
    })

    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea
    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [prompt])

    // Focus textarea when dialog opens
    React.useEffect(() => {
        if (open && textareaRef.current) {
            setTimeout(() => textareaRef.current?.focus(), 100)
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className={className}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create with AI
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[580px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {/* Prompt Input */}
                    <div className="space-y-2">
                        <label htmlFor="ai-prompt" className="text-sm font-medium">
                            Describe your workflow
                        </label>
                        <textarea
                            id="ai-prompt"
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className={cn(
                                'w-full min-h-[140px] max-h-[300px] px-4 py-3 rounded-lg',
                                'bg-background border border-border',
                                'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                                'placeholder:text-muted-foreground/60',
                                'resize-none transition-all',
                                'text-sm leading-relaxed'
                            )}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                            Try these examples:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'Send Gmail summary to WhatsApp daily',
                                'Log WhatsApp orders to Google Sheets',
                                'Email me when new row added to Sheets',
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => setSuggestion(suggestion)}
                                    disabled={isLoading}
                                    className={cn(
                                        'px-3 py-1.5 text-xs rounded-md',
                                        'bg-muted hover:bg-muted/80 text-foreground',
                                        'border border-border hover:border-primary/50',
                                        'transition-colors',
                                        'disabled:opacity-50 disabled:cursor-not-allowed'
                                    )}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!prompt.trim() || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Generate Workflow
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Keyboard hint */}
                    <p className="text-xs text-muted-foreground text-center pt-2">
                        Press{' '}
                        <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">
                            ⌘ Enter
                        </kbd>{' '}
                        to generate
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    )
}
