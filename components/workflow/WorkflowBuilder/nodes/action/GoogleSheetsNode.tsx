'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { BaseActionNode, BaseActionNodeData, ActionNodeConfig } from './BaseActionNode'

const GoogleSheetsIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg
        viewBox="0 0 48 48"
        className={className}
        style={style}
        fill="currentColor"
    >
        <path fill="#0F9D58" d="M37,45H11c-1.657,0-3-1.343-3-3V6c0-1.657,1.343-3,3-3h19l10,10v29C40,43.657,38.657,45,37,45z" />
        <path fill="#C8E6C9" d="M40 13L30 13 30 3z" />
        <path fill="#E8F5E9" d="M31,23H17c-1.105,0-2,0.895-2,2v2c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2v-2C33,23.895,32.105,23,31,23z" />
        <rect x="15" y="25" width="18" height="2" fill="#0F9D58" opacity="0.3" />
        <path fill="#E8F5E9" d="M31,31H17c-1.105,0-2,0.895-2,2v2c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2v-2C33,31.895,32.105,31,31,31z" />
        <rect x="15" y="33" width="18" height="2" fill="#0F9D58" opacity="0.3" />
        <path fill="#E8F5E9" d="M31,15H17c-1.105,0-2,0.895-2,2v2c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2v-2C33,15.895,32.105,15,31,15z" />
        <rect x="15" y="17" width="18" height="2" fill="#0F9D58" opacity="0.3" />
    </svg>
)

export const GoogleSheetsNode = memo((props: NodeProps<BaseActionNodeData>) => {
    const config: ActionNodeConfig = {
        icon: GoogleSheetsIcon as any,
        color: '#0F9D58',
        detailsContent: (data) => (
            <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase font-mono">Action</div>
                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {data.config?.action === 'write' ? 'Write Data' :
                        data.config?.action === 'append' ? 'Append Row' : 'Read Sheets'}
                </div>
            </div>
        )
    }

    return <BaseActionNode {...props} config={config} />
})

GoogleSheetsNode.displayName = 'GoogleSheetsNode'
