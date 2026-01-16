'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { BaseTriggerNode, BaseTriggerNodeData, TriggerNodeConfig } from './BaseTriggerNode'
import { EmailIcon } from './CustomIcons'

interface EmailTriggerData extends BaseTriggerNodeData {
    config?: {
        email_address?: string
        imap_server?: string
        port?: number
        use_ssl?: boolean
    }
}

const EmailDetailsContent = ({ data }: { data: EmailTriggerData }) => {
    return (
        <div className="space-y-3">
            {data.config?.email_address && (
                <div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Email Address</div>
                    <div className="text-[10px] font-mono bg-background/50 rounded px-1.5 py-1 border border-border/50 truncate">
                        {data.config.email_address}
                    </div>
                </div>
            )}
            {data.config?.imap_server && (
                <div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">IMAP Server</div>
                    <div className="text-[10px] font-mono bg-background/50 rounded px-1.5 py-1 border border-border/50 truncate">
                        {data.config.imap_server}:{data.config.port || 993}
                    </div>
                </div>
            )}
        </div>
    )
}

export const EmailTriggerNode = memo((props: NodeProps<EmailTriggerData>) => {
    const config: TriggerNodeConfig = {
        icon: EmailIcon,
        color: '#3b82f6',
        detailsContent: (data: BaseTriggerNodeData) => <EmailDetailsContent data={data as EmailTriggerData} />,
        isConnected: (data: BaseTriggerNodeData) => {
            const emailData = data as EmailTriggerData
            return !!(emailData.config?.email_address && emailData.config?.imap_server)
        }
    }

    return <BaseTriggerNode {...props} config={config} />
})

EmailTriggerNode.displayName = 'EmailTriggerNode'
