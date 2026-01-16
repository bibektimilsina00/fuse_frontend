'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { GitBranch, Brain } from 'lucide-react'
import { BaseLogicNode, BaseLogicNodeData, LogicNodeConfig } from './BaseLogicNode'

export const IfConditionNode = memo((props: NodeProps<BaseLogicNodeData>) => {
    const config: LogicNodeConfig = {
        icon: GitBranch,
        color: '#8b5cf6', // Logic violet
        detailsContent: (data) => (
            <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase font-mono">Condition</div>
                <div className="text-xs font-medium text-foreground truncate">
                    {data.config?.condition || 'If [value] equals...'}
                </div>
            </div>
        )
    }

    return <BaseLogicNode {...props} config={config} />
})

IfConditionNode.displayName = 'IfConditionNode'

export const SwitchNode = memo((props: NodeProps<BaseLogicNodeData>) => {
    const config: LogicNodeConfig = {
        icon: Brain,
        color: '#8b5cf6',
    }

    return <BaseLogicNode {...props} config={config} />
})

SwitchNode.displayName = 'SwitchNode'
