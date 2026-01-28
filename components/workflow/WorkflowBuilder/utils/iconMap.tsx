import * as LucideIcons from 'lucide-react'
import { LucideIcon, Settings, Zap } from 'lucide-react'
import { ComponentType } from 'react'
import { cn } from '@/lib/utils'

type IconComponent = LucideIcon | ComponentType<{ className?: string }>

/**
 * Gets a Lucide icon component by its name.
 * Handles case-insensitive matches and returns a fallback if not found.
 */
export const getIconByName = (name?: string): LucideIcon => {
    if (!name) return Settings

    // Try exact match
    if ((LucideIcons as any)[name]) return (LucideIcons as any)[name]

    // Try PascalCase (common in manifests)
    const pascalName = name.charAt(0).toUpperCase() + name.slice(1)
    if ((LucideIcons as any)[pascalName]) return (LucideIcons as any)[pascalName]

    // Search case-insensitive
    const keys = Object.keys(LucideIcons)
    const match = keys.find(k => k.toLowerCase() === name.toLowerCase())
    if (match) return (LucideIcons as any)[match]

    return Settings
}

/**
 * Renders an SVG string or a Lucide icon.
 */
export const IconRenderer: React.FC<{
    icon?: string;
    icon_svg?: string;
    className?: string;
    style?: React.CSSProperties;
    fallback?: LucideIcon;
}> = ({ icon, icon_svg, className, style, fallback = Settings }) => {
    if (icon_svg) {
        return (
            <div
                className={cn(className, "flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto")}
                style={style}
                dangerouslySetInnerHTML={{ __html: icon_svg }}
            />
        )
    }

    const Icon = getIconByName(icon)
    return <Icon className={className} style={style} />
}

export const getNodeIcon = (nodeName: string, nodeType: string = 'action', iconName?: string): IconComponent => {
    if (iconName) return getIconByName(iconName)
    return nodeType === 'trigger' ? Zap : Settings
}
