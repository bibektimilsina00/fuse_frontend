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

export function FloatingAIButton({ className }: FloatingAIButtonProps) {
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
                    "relative h-14 w-14 flex items-center justify-center rounded-full shadow-2xl",
                    "bg-primary text-primary-foreground",
                    "hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]",
                    "transition-all duration-300 ease-out",
                    "border border-white/10"
                )}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.9 }}
            >
                {/* Subtle Glow Ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Content */}
                <div className="relative z-10">
                    <Sparkles className={cn(
                        "h-6 w-6 transition-transform duration-500",
                        isHovered ? "rotate-12 scale-110" : ""
                    )} />
                </div>
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="absolute bottom-0 right-full mr-4 px-4 py-2 bg-popover/80 backdrop-blur-xl text-popover-foreground rounded-2xl shadow-xl border border-border text-[13px] font-semibold whitespace-nowrap"
                    >
                        AI Assistant
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2.5 h-2.5 bg-popover border-r border-t border-border" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
