
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Option {
    label: string
    value: string
    description?: string
    [key: string]: any
}

interface CustomSelectProps {
    value: string
    onChange: (value: string) => void
    options: Option[]
    placeholder?: string
    disabled?: boolean
    className?: string
    itemIcon?: React.ElementType
}

export const CustomSelect = ({
    value,
    onChange,
    options,
    placeholder = "Select...",
    disabled,
    className,
    itemIcon: ItemIcon
}: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(o => o.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "w-full h-10 px-3 bg-muted/20 border border-border rounded-md text-xs text-left flex items-center justify-between transition-all focus:ring-1 focus:ring-primary/50 outline-none hover:bg-muted/30",
                    disabled && "opacity-50 cursor-not-allowed",
                    isOpen && "ring-1 ring-primary/50 border-primary/50"
                )}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {ItemIcon && <ItemIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />}
                    <div className="flex flex-col truncate">
                        <span className={cn("font-medium truncate", !selectedOption && "text-muted-foreground")}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                        {selectedOption?.description && (
                            <span className="text-[9px] text-muted-foreground/70 truncate -mt-0.5">
                                {selectedOption.description.split('•')[0]} {/* Short preview */}
                            </span>
                        )}
                    </div>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover/95 backdrop-blur-xl border border-border shadow-2xl rounded-md overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar"
                    >
                        {options.length === 0 ? (
                            <div className="p-3 text-[10px] text-muted-foreground text-center">No options available</div>
                        ) : (
                            <div className="p-1 space-y-0.5">
                                {options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            onChange(opt.value)
                                            setIsOpen(false)
                                        }}
                                        className={cn(
                                            "w-full text-left p-2 rounded-sm flex items-start gap-2 hover:bg-accent transition-colors group",
                                            opt.value === value && "bg-primary/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                            {ItemIcon && <ItemIcon className="w-3.5 h-3.5 opacity-70 shrink-0" />}
                                            <div className="flex-1 min-w-0">
                                                <div className={cn(
                                                    "text-xs font-medium truncate",
                                                    opt.value === value ? "text-primary" : "text-foreground"
                                                )}>
                                                    {opt.label}
                                                </div>
                                                {opt.description && (
                                                    <div className="text-[10px] text-muted-foreground truncate opacity-70 group-hover:opacity-100">
                                                        {opt.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {opt.value === value && (
                                            <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
