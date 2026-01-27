'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Zap, Settings, HelpCircle, Bot, MessageSquare, Database, Globe, Code, Brain, Mail, Webhook, FileText, Clock, Timer, Rss } from 'lucide-react'
import { BaseTriggerNode, BaseTriggerNodeData, TriggerNodeConfig } from './BaseTriggerNode'

export const GenericTriggerNode = memo((props: NodeProps<BaseTriggerNodeData>) => {
    const { data } = props

    // Unified icon mapping
    const getIcon = () => {
        if (data.icon_svg) {
            return ({ className, style }: { className?: string, style?: any }) => (
                <div
                    className={`${className} flex items-center justify-center [&>svg]:w-full [&>svg]:h-full`}
                    style={style}
                    dangerouslySetInnerHTML={{ __html: data.icon_svg! }}
                />
            )
        }

        // STRICT MODE: If no icon_svg is provided, show a "Missing Icon" placeholder
        // This forces developers to include an icon.svg in their node package
        return ({ className, style }: { className?: string, style?: any }) => (
            <div className={`${className} flex items-center justify-center bg-destructive/10 text-destructive rounded-sm`} style={style} title="Missing Icon">
                <span className="text-[8px] font-bold">?</span>
            </div>
        )
    }

    const getColor = () => {
        const nodeName = data.node_name?.toLowerCase() || ''

        if (nodeName.includes('schedule') || nodeName.includes('cron')) return '#10b981' // emerald
        if (nodeName.includes('webhook')) return '#f59e0b' // amber
        if (nodeName.includes('email') || nodeName.includes('mail')) return '#f97316' // orange
        if (nodeName.includes('trigger') || nodeName.includes('manual')) return '#f43f5e' // rose
        return '#ef4444' // default trigger red
    }

    const config: TriggerNodeConfig = {
        icon: getIcon(),
        color: getColor(),
        detailsContent: (data) => {
            if (!data.config || Object.keys(data.config).length === 0) return null
            return (
                <div className="space-y-1">
                    {Object.entries(data.config).slice(0, 3).map(([key, value]) => (
                        <div key={key}>
                            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">{key.replace(/_/g, ' ')}</div>
                            <div className="text-[10px] font-mono bg-background/50 rounded px-1.5 py-0.5 border border-border/50 truncate max-w-full">
                                {String(value)}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }
    }

    return <BaseTriggerNode {...props} config={config} />
})

GenericTriggerNode.displayName = 'GenericTriggerNode'
