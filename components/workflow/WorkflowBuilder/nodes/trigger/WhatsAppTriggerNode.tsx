'use client'

import { memo, useState } from 'react'
import { NodeProps } from 'reactflow'
import { Copy, Check } from 'lucide-react'
import { BaseTriggerNode, BaseTriggerNodeData, TriggerNodeConfig } from './BaseTriggerNode'
import { WhatsAppIcon } from './CustomIcons'

interface WhatsAppTriggerData extends BaseTriggerNodeData {
    config?: {
        verify_token?: string
        phone_number_id?: string
        webhook_url?: string
    }
}

const WhatsAppDetailsContent = ({ data }: { data: WhatsAppTriggerData }) => {
    const [copied, setCopied] = useState(false)

    const copyWebhookUrl = () => {
        if (data.config?.webhook_url) {
            navigator.clipboard.writeText(data.config.webhook_url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="space-y-3">
            {data.config?.phone_number_id && (
                <div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Phone ID</div>
                    <div className="text-[10px] font-mono bg-background/50 rounded px-1.5 py-1 border border-border/50 truncate">
                        {data.config.phone_number_id}
                    </div>
                </div>
            )}
            {data.config?.webhook_url && (
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Webhook URL</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                copyWebhookUrl();
                            }}
                            className="p-1 hover:bg-emerald-500/10 rounded transition-colors"
                        >
                            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                        </button>
                    </div>
                    <div className="text-[10px] font-mono bg-background/50 rounded px-1.5 py-1 border border-border/50 truncate">
                        {data.config.webhook_url}
                    </div>
                </div>
            )}
        </div>
    )
}

export const WhatsAppTriggerNode = memo((props: NodeProps<WhatsAppTriggerData>) => {
    const config: TriggerNodeConfig = {
        icon: WhatsAppIcon,
        color: '#25D366',
        detailsContent: (data: BaseTriggerNodeData) => <WhatsAppDetailsContent data={data as WhatsAppTriggerData} />,
        isConnected: (data: BaseTriggerNodeData) => {
            const whatsappData = data as WhatsAppTriggerData
            return !!(whatsappData.config?.phone_number_id && whatsappData.config?.verify_token)
        }
    }

    return <BaseTriggerNode {...props} config={config} />
})

WhatsAppTriggerNode.displayName = 'WhatsAppTriggerNode'
