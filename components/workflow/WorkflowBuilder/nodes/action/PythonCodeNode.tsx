'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Code, Terminal, FileCode } from 'lucide-react'
import { BaseActionNode, BaseActionNodeData, ActionNodeConfig } from './BaseActionNode'

export const PythonCodeNode = memo((props: NodeProps<BaseActionNodeData>) => {
    const config: ActionNodeConfig = {
        icon: FileCode,
        color: '#ffde57', // Python Yellow
        detailsContent: (data) => (
            <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase font-mono">Environment</div>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Terminal className="h-3 w-3" /> Python 3.10
                </div>
            </div>
        )
    }

    return <BaseActionNode {...props} config={config} />
})

PythonCodeNode.displayName = 'PythonCodeNode'
