'use client'

import { memo, useState, useMemo } from 'react'
import { Position, NodeProps, useReactFlow } from 'reactflow'
import { Bot, Settings, ChevronDown, Sparkles, Cpu, Database, Wrench, Brain, Layers } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { QuickAddButton } from '../QuickAddButton'
import { validateNodeConfig } from '../../utils/nodeValidation'
import { useNodeTypes } from '@/services/queries/workflows'
import { NodeTypeDefinition } from '@/types'
import {
    NodeHandle,
    NodeToolbar,
    ValidationBadge,
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

    const nodeTypeDefinition = (nodeTypes as any[]).find(
        t => t.name === data.node_name
    )

    const isRunning = data.status === 'running'


    return (
        <div
            className="relative"
            onMouseEnter={() => setShowToolbar(true)}
            onMouseLeave={() => setShowToolbar(false)}
        >
            <NodeToolbar
                show={showToolbar}
                isRunning={isRunning}
                onExecute={() => data.executeNode?.(id)}
                onDelete={() => {
                    setNodes((nds) => nds.filter((node) => node.id !== id))
                    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
                }}
            />

            <div className="flex flex-col items-center gap-4 group/node scale-110">
                <div className="relative">
                    {/* Node Body */}
                    <motion.div
                        layout
                        className={cn(
                            "relative w-72 bg-card/90 backdrop-blur-xl border-2 transition-all duration-300 shadow-2xl overflow-hidden",
                            selected ? "border-primary ring-4 ring-primary/20" : "border-border hover:border-border-strong",
                            isRunning && "border-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]",
                        )}
                        style={{
                            borderRadius: '32px',
                            background: `linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--card)/0.95) 100%)`,
                        }}
                    >
                        <RunningBorder color={CONFIG.color} borderRadius="32px" isRunning={isRunning} />

                        {/* Main Header */}
                        <div className="p-5 flex items-center gap-4 relative z-10 border-b border-border/50">
                            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundColor: CONFIG.color }} />

                            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-500 shadow-inner">
                                <IconRenderer
                                    icon={data.spec?.icon || data.icon || 'Bot'}
                                    icon_svg={data.spec?.icon_svg || data.icon_svg}
                                    className="h-8 w-8"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-lg text-foreground leading-tight tracking-tight">Agent</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
                                        ReAct Engine
                                    </span>
                                </div>
                            </div>

                            <StatusIndicator status={data.status || 'idle'} />
                        </div>

                        {/* Static Sections */}
                        <div className="px-3 pb-4 space-y-4 mt-2">
                            <AgentSection
                                icon={Cpu}
                                label="Chat Model"
                                color="#8b5cf6"
                                connector={(
                                    <div className="relative h-6 w-full flex items-center">
                                        <NodeHandle
                                            type="target"
                                            position={Position.Left}
                                            handleId="chat_model"
                                            isConnectable={isConnectable}
                                            color="#8b5cf6"
                                            style={{ left: '-12px' }}
                                        />
                                        <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest pl-1">Knowledge Engine</div>
                                    </div>
                                )}
                            />

                            <AgentSection
                                icon={Layers}
                                label="Tools"
                                color="#f59e0b"
                                connector={(
                                    <div className="relative h-6 w-full flex items-center">
                                        <NodeHandle
                                            type="target"
                                            position={Position.Left}
                                            handleId="tools"
                                            isConnectable={isConnectable}
                                            color="#f59e0b"
                                            style={{ left: '-12px' }}
                                        />
                                        <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest pl-1">Capabilities</div>
                                    </div>
                                )}
                            />

                            <AgentSection
                                icon={Database}
                                label="Memory"
                                color="#3b82f6"
                                connector={(
                                    <div className="relative h-6 w-full flex items-center">
                                        <NodeHandle
                                            type="target"
                                            position={Position.Left}
                                            handleId="memory"
                                            isConnectable={isConnectable}
                                            color="#3b82f6"
                                            style={{ left: '-12px' }}
                                        />
                                        <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest pl-1">Context Window</div>
                                    </div>
                                )}
                            />
                        </div>

                        {/* IO Handles */}
                        <div className="absolute top-[45px] left-0">
                            <NodeHandle
                                type="target"
                                position={Position.Left}
                                handleId="input"
                                isConnectable={isConnectable}
                                color="#9ca3af"
                            />
                        </div>

                        <div className="absolute top-[45px] right-0">
                            <NodeHandle
                                type="source"
                                position={Position.Right}
                                handleId="output"
                                isConnectable={isConnectable}
                                color={CONFIG.color}
                            />
                            <QuickAddButton nodeId={id} handleId="output" color={CONFIG.color} connectionType="source" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
})

interface AgentSectionProps {
    icon: any
    label: string
    color: string
    connector: React.ReactNode
}

const AgentSection = ({ icon: Icon, label, color, connector }: AgentSectionProps) => (
    <div className="w-full px-2">
        <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1 rounded bg-background border border-border shadow-sm">
                <Icon className="h-3 w-3" style={{ color }} />
            </div>
            <span className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">{label}</span>
        </div>
        <div className="bg-muted/30 rounded-xl p-2 border border-border/50">
            {connector}
        </div>
    </div>
)

AIAgentNode.displayName = 'AIAgentNode'
