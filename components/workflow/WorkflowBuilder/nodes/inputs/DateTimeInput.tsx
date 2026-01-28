import React from 'react'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateTimeInputProps {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    className?: string
}

export function DateTimeInput({ value, onChange, disabled, className }: DateTimeInputProps) {
    return (
        <div className={cn("relative group", className)}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none group-focus-within:text-primary transition-colors">
                <Calendar className="h-4 w-4" />
            </div>
            <input
                type="datetime-local"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:dark]"
            />
        </div>
    )
}
