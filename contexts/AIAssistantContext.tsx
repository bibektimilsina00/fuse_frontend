'use client'

import React, { createContext, useContext, useState } from 'react'

type AssistantMode = 'help' | 'create'

interface AIAssistantContextValue {
    isOpen: boolean
    mode: AssistantMode
    openAssistant: (mode?: AssistantMode) => void
    closeAssistant: () => void
}

const AIAssistantContext = createContext<AIAssistantContextValue | undefined>(undefined)

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState<AssistantMode>('help')

    const openAssistant = (newMode: AssistantMode = 'help') => {
        setMode(newMode)
        setIsOpen(true)
    }

    const closeAssistant = () => {
        setIsOpen(false)
    }

    return (
        <AIAssistantContext.Provider value={{ isOpen, mode, openAssistant, closeAssistant }}>
            {children}
        </AIAssistantContext.Provider>
    )
}

export function useAIAssistant() {
    const context = useContext(AIAssistantContext)
    if (!context) {
        throw new Error('useAIAssistant must be used within AIAssistantProvider')
    }
    return context
}
