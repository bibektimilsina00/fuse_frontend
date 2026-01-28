'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import {
    Zap, Settings, Bot, MessageSquare, Database, Globe, Code, Brain,
    Mail, Send, Share2, FileText, Download, Upload, Trash2, Edit,
    Shuffle, Sparkles
} from 'lucide-react'
import { BaseActionNode, BaseActionNodeData, ActionNodeConfig } from './BaseActionNode'
// Local icons removed in favor of manifest-driven icons

export const GenericActionNode = memo((props: NodeProps<BaseActionNodeData>) => {
    const { data } = props

    // Color is still somewhat derived from name for visual themes, 
    // but icons are strictly from manifest now.

    const getColor = () => {
        const nodeName = data.node_name?.toLowerCase() || ''

        if (nodeName.includes('ai')) return '#8b5cf6' // violet
        if (nodeName.includes('discord')) return '#5865F2' // Discord Blurple
        if (nodeName.includes('whatsapp') || nodeName.includes('slack')) return '#25d366'
        if (nodeName.includes('email') || nodeName.includes('mail')) return '#3b82f6'
        if (nodeName.includes('db') || nodeName.includes('database') || nodeName.includes('google_sheets')) return '#f59e0b'

        return '#3b82f6' // default blue for actions
    }

    const config: ActionNodeConfig = {
        icon: data.icon,
        icon_svg: data.icon_svg,
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

    return <BaseActionNode {...props} config={config} />
})

GenericActionNode.displayName = 'GenericActionNode'
