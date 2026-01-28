'use client'

import { memo, useState } from 'react'
import { Position, NodeProps, useReactFlow } from 'reactflow'
import { Bot, Cpu, Database, Layers } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { QuickAddButton } from '../QuickAddButton'
import { useNodeTypes } from '@/services/queries/workflows'
import {
    NodeHandle,
    NodeToolbar,
    StatusIndicator,
    RunningBorder
} from '../core'
import { BaseActionNodeData } from '../action/BaseActionNode'
import { IconRenderer } from '../../utils/iconMap'

const CONFIG = {
    color: '#8b5cf6', // Violet for AI
}

export const AIAgentNode = memo((props: NodeProps<BaseActionNodeData>) => {
    const { data, isConnectable, selected, id } = props
    const [showToolbar, setShowToolbar] = useState(false)
    const { setNodes, setEdges } = useReactFlow()
    const { toast } = useToast()
    const { data: nodeTypes = [] } = useNodeTypes()

    const isRunning = data.status === 'running'

    const handleExecute = async () => {
        if (data.executeNode) {
            await data.executeNode(id)
        } else {
            toast({ title: "Error", description: "Execute function not available", variant: "destructive" })
        }
    }

    const handleDelete = () => {
        setNodes((nds) => nds.filter((node) => node.id !== id))
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
    }

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowToolbar(true)}
            onMouseLeave={() => setShowToolbar(false)}
        >
            <NodeToolbar
                show={showToolbar}
                isRunning={isRunning}
                onExecute={handleExecute}
                onDelete={handleDelete}
            />

            <div className="flex flex-col items-center gap-2 group/node">
                <div className="relative">
                    {/* Node Body - Wider for Agent */}
                    <div
                        className={cn(
                            "relative w-64 h-24 bg-card/90 backdrop-blur-xl border-2 transition-all duration-300 shadow-xl overflow-hidden",
                            selected ? "border-primary ring-4 ring-primary/20" : "border-border hover:border-border-strong",
                            isRunning && "border-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]",
                        )}
                        style={{
                            borderRadius: '24px',
                            background: `linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--card)/0.95) 100%)`,
                        }}
                    >
                        <RunningBorder color={CONFIG.color} borderRadius="26px" isRunning={isRunning} />

                        {/* Main Content */}
                        <div className="w-full h-full flex items-center justify-center gap-3 relative z-10 px-4">
                            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundColor: CONFIG.color }} />

                            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500 overflow-hidden">
                                <IconRenderer
                                    icon={data.spec?.icon || data.icon || 'Bot'}
                                    icon_svg={data.spec?.icon_svg || data.icon_svg}
                                    className="h-8 w-8"
                                />
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                                <div className="font-bold text-base text-foreground leading-tight truncate">
                                    {data.settings?.goal || data.label || 'AI Agent'}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono opacity-70 mt-0.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-violet-500" />
                                    Autonomous Agent
                                </div>
                            </div>

                            {/* Status */}
                            <div className="shrink-0">
                                <StatusIndicator status={data.status || 'idle'} />
                            </div>
                        </div>
                    </div>

                    {/* Standard IO Handles */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0">
                        <NodeHandle
                            type="target"
                            position={Position.Left}
                            handleId="input"
                            isConnectable={isConnectable}
                            color="#9ca3af"
                        />
                    </div>

                    <div className="absolute top-1/2 -translate-y-1/2 right-0">
                        <NodeHandle
                            type="source"
                            position={Position.Right}
                            handleId="output"
                            isConnectable={isConnectable}
                            color={CONFIG.color}
                        />
                        <QuickAddButton nodeId={id} handleId="output" color={CONFIG.color} connectionType="source" />
                    </div>

                    {/* === Custom AI Connectors === */}

                    {/* Chat Model */}
                    <div className="absolute top-full left-[20%] -translate-x-1/2 flex flex-col items-center z-50">
                        <span className="absolute -top-6 text-[10px] font-medium text-muted-foreground whitespace-nowrap pointer-events-none">Chat Model*</span>
                        <NodeHandle
                            type="target"
                            position={Position.Bottom}
                            handleId="chat_model"
                            isConnectable={isConnectable}
                            color="#9ca3af"
                            style={{ top: '-10px', left: '50%', transform: 'translateX(-50%)' }}
                        />
                        <QuickAddButton
                            nodeId={id}
                            handleId="chat_model"
                            position="bottom"
                            connectionType="target"
                            color={CONFIG.color}
                            style={{ top: '0px' }}
                            filterType="ai_chat_model"
                        />
                    </div>

                    {/* Memory */}
                    <div className="absolute top-full left-[50%] -translate-x-1/2 flex flex-col items-center z-50">
                        <span className="absolute -top-6 text-[10px] font-medium text-muted-foreground whitespace-nowrap pointer-events-none">Memory</span>
                        <NodeHandle
                            type="target"
                            position={Position.Bottom}
                            handleId="memory"
                            isConnectable={isConnectable}
                            color="#9ca3af"
                            style={{ top: '-10px', left: '50%', transform: 'translateX(-50%)' }}
                        />
                        <QuickAddButton
                            nodeId={id}
                            handleId="memory"
                            position="bottom"
                            connectionType="target"
                            color={CONFIG.color}
                            style={{ top: '0px' }}
                            filterType="ai_memory"
                        />
                    </div>

                    {/* Tools */}
                    <div className="absolute top-full left-[80%] -translate-x-1/2 flex flex-col items-center z-50">
                        <span className="absolute -top-6 text-[10px] font-medium text-muted-foreground whitespace-nowrap pointer-events-none">Tools</span>
                        <NodeHandle
                            type="target"
                            position={Position.Bottom}
                            handleId="tools"
                            isConnectable={isConnectable}
                            color="#9ca3af"
                            style={{ top: '-10px', left: '50%', transform: 'translateX(-50%)' }}
                        />
                        <QuickAddButton
                            nodeId={id}
                            handleId="tools"
                            position="bottom"
                            connectionType="target"
                            color={CONFIG.color}
                            style={{ top: '0px' }}
                            filterType="ai_tool"
                            allowMultiple={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
})

AIAgentNode.displayName = 'AIAgentNode'
