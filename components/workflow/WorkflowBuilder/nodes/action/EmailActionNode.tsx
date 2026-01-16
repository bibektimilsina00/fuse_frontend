'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Mail, Send } from 'lucide-react'
import { BaseActionNode, BaseActionNodeData, ActionNodeConfig } from './BaseActionNode'

export const EmailActionNode = memo((props: NodeProps<BaseActionNodeData>) => {
    const config: ActionNodeConfig = {
        icon: Mail,
        color: '#3b82f6', // Premium Blue
        detailsContent: (data) => (
            <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                    <Send className="h-3 w-3 text-blue-500" />
                    <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-tight">Recipients</span>
                </div>
                <div className="text-xs font-medium text-foreground truncate pl-4">
                    {data.config?.to || 'No recipient set'}
                </div>
                {data.config?.subject && (
                    <div className="text-[10px] text-muted-foreground italic truncate pl-4">
                        Re: {data.config.subject}
                    </div>
                )}
            </div>
        )
    }

    return <BaseActionNode {...props} config={config} />
})

EmailActionNode.displayName = 'EmailActionNode'
