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
        const nodeName = data.node_name || ''
        const icons: Record<string, any> = {
            'condition.if': Split,
            'logic.parallel': GitBranch,
            'logic.merge': GitMerge,
            'logic.delay': Clock,
            'logic.loop': RotateCw,
            'logic.switch': Shuffle,
            'condition.switch': Shuffle,
            'logic.pause': PauseCircle,
            'execution.pause': PauseCircle,
            'utility.noop': Activity
        }
        return icons[nodeName] || Split
    }

    const getColor = () => {
        return '#8b5cf6' // Consistent purple for logic/decisions
    }

    const config: LogicNodeConfig = {
        icon: getIcon(),
        color: getColor(),
    }

    return <BaseLogicNode {...props} config={config} />
})

GenericLogicNode.displayName = 'GenericLogicNode'
