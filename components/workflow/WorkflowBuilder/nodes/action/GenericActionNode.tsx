'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import {
    Zap, Settings, Bot, MessageSquare, Database, Globe, Code, Brain,
    Mail, Send, Share2, FileText, Download, Upload, Trash2, Edit,
    Shuffle, Sparkles
} from 'lucide-react'
import { BaseActionNode, BaseActionNodeData, ActionNodeConfig } from './BaseActionNode'
import { LogoGoogleSheets, LogoWhatsApp } from '../../icons/BrandIcons'

const iconMap: Record<string, any> = {
    Zap,
    Settings,
    Bot,
    MessageSquare,
    Database,
    Globe,
    Code,
    Brain,
    Mail,
    Send,
    Share2,
    FileText,
    Download,
    Upload,
    Trash2,
    Edit
}

export const GenericActionNode = memo((props: NodeProps<BaseActionNodeData>) => {
    const { data } = props

    const getIcon = () => {
        const nodeName = data.node_name || ''
        const icons: Record<string, any> = {
            'data.set': Edit,
            'data.transform': Shuffle,
            'slack.send': MessageSquare,
            'discord.send': MessageSquare, // Or generic chat icon
            'whatsapp.send': LogoWhatsApp,
            'email.send': Mail,
            'http.request': Globe,
            'ai.llm': Sparkles,
            'ai.agent': Bot,
            'data.store': Database,
            'google_sheets.read': LogoGoogleSheets,
            'google_sheets.write': LogoGoogleSheets,
        }
        return icons[nodeName] || Settings
    }

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
        icon: getIcon(),
        color: getColor(),
    }

    return <BaseActionNode {...props} config={config} />
})

GenericActionNode.displayName = 'GenericActionNode'
