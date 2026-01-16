'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Zap, Settings, HelpCircle, Bot, MessageSquare, Database, Globe, Code, Brain, Mail, Webhook, FileText, Clock, Timer, Rss } from 'lucide-react'
import { BaseTriggerNode, BaseTriggerNodeData, TriggerNodeConfig } from './BaseTriggerNode'

export const GenericTriggerNode = memo((props: NodeProps<BaseTriggerNodeData>) => {
    const { data } = props

    // Unified icon mapping
    const getIcon = () => {
        const nodeName = data.node_name || ''
        const icons: Record<string, any> = {
            'schedule.cron': Timer,
            'webhook.receive': Webhook,
            'email.receive': Mail,
            'whatsapp.receive': Zap,
            'rss.read': Rss,
            'manual.trigger': Zap
        }
        return icons[nodeName] || Zap
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
    }

    return <BaseTriggerNode {...props} config={config} />
})

GenericTriggerNode.displayName = 'GenericTriggerNode'
