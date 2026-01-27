'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Split, GitBranch, Filter, Shuffle, ListFilter, GitMerge, RotateCw, Clock, PauseCircle, Activity } from 'lucide-react'
import { BaseLogicNode, BaseLogicNodeData, LogicNodeConfig } from './BaseLogicNode'

const iconMap: Record<string, any> = {
    Split,
    GitBranch,
    Filter,
    Shuffle,
    ListFilter
}

export const GenericLogicNode = memo((props: NodeProps<BaseLogicNodeData>) => {
    const { data } = props

    const getIcon = () => {
        if (data.icon_svg) {
            return ({ className, style }: { className?: string, style?: any }) => (
                <div
                    className={`${className} flex items-center justify-center [&>svg]:w-full [&>svg]:h-full`}
                    style={style}
                    dangerouslySetInnerHTML={{ __html: data.icon_svg! }}
                />
            )
        }

        // STRICT MODE: If no icon_svg is provided, show a "Missing Icon" placeholder
        return ({ className, style }: { className?: string, style?: any }) => (
            <div className={`${className} flex items-center justify-center bg-destructive/10 text-destructive rounded-sm`} style={style} title="Missing Icon">
                <span className="text-[8px] font-bold">?</span>
            </div>
        )
    }

    const getColor = () => {
        return '#8b5cf6' // Consistent purple for logic/decisions
    }

    const config: LogicNodeConfig = {
        icon: getIcon(),
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

    return <BaseLogicNode {...props} config={config} />
})

GenericLogicNode.displayName = 'GenericLogicNode'
