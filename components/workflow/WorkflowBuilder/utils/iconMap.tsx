import {
    PlayCircle, Timer, Webhook, Inbox, Rss, Zap,
    Sparkles, Bot,
    Edit3, Shuffle, MessageSquare, Globe, Code, Send,
    Split, GitBranch, GitMerge, RotateCw, PauseCircle, Activity,
    Settings, Clock as ClockIcon,
    LucideIcon
} from 'lucide-react'
import { LogoGoogleSheets, LogoWhatsApp, LogoPython } from '../icons/BrandIcons'
import { ComponentType } from 'react'

type IconComponent = LucideIcon | ComponentType<{ className?: string }>

const IconMap: Record<string, IconComponent> = {
    // Triggers
    'manual.trigger': PlayCircle,
    'schedule.cron': Timer,
    'webhook.receive': Webhook,
    'whatsapp.trigger': LogoWhatsApp,
    'email.trigger': Inbox,
    'rss.trigger': Rss,

    // AI
    'ai.llm': Sparkles,
    'ai.agent': Bot,

    // Actions
    'data.set': Edit3,
    'data.transform': Shuffle,
    'slack.send': MessageSquare,
    'whatsapp.send': LogoWhatsApp,
    'google_sheets.write': LogoGoogleSheets,
    'google_sheets.read': LogoGoogleSheets,
    'http.request': Globe,
    'code.python': LogoPython,
    'code.javascript': Code,
    'email.send': Send,
    'discord.send': Send,

    // Logic
    'condition.if': Split,
    'logic.parallel': GitBranch,
    'logic.merge': GitMerge,
    'logic.delay': ClockIcon,
    'logic.loop': RotateCw,
    'logic.switch': Shuffle,
    'logic.pause': PauseCircle,
    'execution.pause': PauseCircle,

    // Utilities
    'utility.noop': Activity
}

export const getNodeIcon = (nodeName: string, nodeType: string = 'action'): IconComponent => {
    return IconMap[nodeName] || (nodeType === 'trigger' ? Zap : Settings)
}
