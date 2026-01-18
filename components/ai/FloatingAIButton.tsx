'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAIAssistant } from '@/components/providers'
import { cn } from '@/lib/utils'

interface FloatingAIButtonProps {
    onCreateWorkflow?: (prompt: string, model: string, credentialId?: string) => Promise<void>
    className?: string
}

export function FloatingAIButton({ onCreateWorkflow, className }: FloatingAIButtonProps) {
    const { openAssistant } = useAIAssistant()
    const [isHovered, setIsHovered] = useState(false)

    return (
        <motion.div
            className={cn("fixed bottom-8 right-8 z-50", className)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        >
            <motion.button
                onClick={() => openAssistant('help')}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "group relative flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl",
                    "bg-gradient-to-tr from-indigo-500 via-primary to-emerald-400",
                    "hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]",
                    "transition-all duration-300 ease-out",
                    "border-2 border-white/20"
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Animated gradient background */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-600 via-primary to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Glow effect */}
                <motion.div
                    className="absolute inset-0 rounded-2xl bg-primary/50 blur-xl"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Content */}
                <div className="relative flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: isHovered ? [0, -10, 10, -10, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Sparkles className="h-5 w-5 text-white" />
                    </motion.div>
                    
                    <motion.span
                        className="text-white font-semibold text-sm whitespace-nowrap"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.3 }}
                    >
                        AI Assistant
                    </motion.span>

                    {/* Pulse indicator */}
                    <motion.div
                        className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full border-2 border-white"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [1, 0.7, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border text-xs font-medium whitespace-nowrap"
                    >
                        Get help or create workflows with AI
                        <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-popover border-r border-b border-border" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
