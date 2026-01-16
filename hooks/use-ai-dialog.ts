import { useState, useCallback } from 'react'
import { logger } from '@/lib/logger'

interface UseAIDialogProps {
    onSubmit?: (prompt: string) => void | Promise<void>
    onSuccess?: () => void
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function useAIDialog({
    onSubmit,
    onSuccess,
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange: setControlledOpen
}: UseAIDialogProps = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
    const [prompt, setPrompt] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen
    const setOpen = useCallback((value: boolean) => {
        if (isControlled) {
            setControlledOpen?.(value)
        } else {
            setUncontrolledOpen(value)
        }
    }, [isControlled, setControlledOpen])

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!prompt.trim() || isLoading) return

        setIsLoading(true)
        try {
            await onSubmit?.(prompt.trim())
            setPrompt('')
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            logger.error('AI creation failed', error)
        } finally {
            setIsLoading(false)
        }
    }, [prompt, isLoading, onSubmit, onSuccess, setOpen])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit()
        }
    }, [handleSubmit])

    const setSuggestion = useCallback((suggestion: string) => {
        setPrompt(suggestion)
    }, [])

    return {
        open,
        setOpen,
        prompt,
        setPrompt,
        isLoading,
        handleSubmit,
        handleKeyDown,
        setSuggestion
    }
}
