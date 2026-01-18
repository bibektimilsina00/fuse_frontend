import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
    className?: string
    children?: React.ReactNode
    variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
    hover?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: React.FC<CardProps> = ({
    className = '',
    children,
    variant = 'default',
    hover = true,
    padding = 'md'
}) => {
    return (
        <div className={cn(
            "rounded-xl transition-all duration-200",
            // Variants
            variant === 'default' && "bg-card border border-border",
            variant === 'elevated' && "bg-card border border-border shadow-lg shadow-black/5",
            variant === 'outlined' && "bg-transparent border border-border",
            variant === 'ghost' && "bg-transparent",
            // Hover states
            hover && variant !== 'ghost' && "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
            // Padding
            padding === 'none' && "p-0",
            padding === 'sm' && "p-4",
            padding === 'md' && "p-6",
            padding === 'lg' && "p-8",
            className
        )}>
            {children}
        </div>
    )
}

// Card Header Component
interface CardHeaderProps {
    className?: string
    children?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className = '', children }) => {
    return (
        <div className={cn("flex items-center justify-between mb-4", className)}>
            {children}
        </div>
    )
}

// Card Title Component
interface CardTitleProps {
    className?: string
    children?: React.ReactNode
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const CardTitle: React.FC<CardTitleProps> = ({
    className = '',
    children,
    as: Component = 'h3'
}) => {
    return (
        <Component className={cn("text-lg font-semibold tracking-tight", className)}>
            {children}
        </Component>
    )
}

// Card Description Component
interface CardDescriptionProps {
    className?: string
    children?: React.ReactNode
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ className = '', children }) => {
    return (
        <p className={cn("text-sm text-muted-foreground", className)}>
            {children}
        </p>
    )
}

// Card Content Component
interface CardContentProps {
    className?: string
    children?: React.ReactNode
}

export const CardContent: React.FC<CardContentProps> = ({ className = '', children }) => {
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    )
}

// Card Footer Component
interface CardFooterProps {
    className?: string
    children?: React.ReactNode
}

export const CardFooter: React.FC<CardFooterProps> = ({ className = '', children }) => {
    return (
        <div className={cn("flex items-center pt-4 mt-4 border-t border-border", className)}>
            {children}
        </div>
    )
}

// Stat Card Component - Specialized for dashboard stats
interface StatCardProps {
    label: string
    value: string | number
    change?: string
    trend?: 'up' | 'down' | 'neutral'
    icon?: React.ReactNode
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'default'
    className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    trend = 'neutral',
    icon,
    color = 'default',
    className = ''
}) => {
    return (
        <div className={cn("stat-card group", className)}>
            <div className="flex items-start justify-between">
                {icon && (
                    <div className={cn(
                        "p-2.5 rounded-xl transition-all duration-300",
                        color === 'blue' && "bg-blue-500/10 group-hover:bg-blue-500/20",
                        color === 'green' && "bg-emerald-500/10 group-hover:bg-emerald-500/20",
                        color === 'purple' && "bg-purple-500/10 group-hover:bg-purple-500/20",
                        color === 'orange' && "bg-orange-500/10 group-hover:bg-orange-500/20",
                        color === 'red' && "bg-red-500/10 group-hover:bg-red-500/20",
                        color === 'default' && "bg-muted group-hover:bg-muted/80"
                    )}>
                        <div className={cn(
                            "h-5 w-5",
                            color === 'blue' && "text-blue-500",
                            color === 'green' && "text-emerald-500",
                            color === 'purple' && "text-purple-500",
                            color === 'orange' && "text-orange-500",
                            color === 'red' && "text-red-500",
                            color === 'default' && "text-muted-foreground"
                        )}>
                            {icon}
                        </div>
                    </div>
                )}
                {change && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                        trend === 'up' && "bg-emerald-500/10 text-emerald-500",
                        trend === 'down' && "bg-red-500/10 text-red-500",
                        trend === 'neutral' && "bg-muted text-muted-foreground"
                    )}>
                        {trend === 'up' && '↑'}
                        {trend === 'down' && '↓'}
                        {change}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
        </div>
    )
}