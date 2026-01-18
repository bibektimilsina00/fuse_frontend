'use client'

import ReactFlow, {
    Background,
    BackgroundVariant,
    Panel,
    Connection,
    Edge,
    Node,
    OnConnect,
    OnEdgesChange,
    OnNodesChange,
    SelectionMode,
    NodeTypes,
    EdgeTypes,
    DefaultEdgeOptions,
    OnSelectionChangeParams
} from 'reactflow'
import { motion } from 'framer-motion'
import {
    Plus, MousePointer2, Hand, ZoomIn, ZoomOut, Maximize,
    Play, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { memo } from 'react'
import type { BaseNodeData } from '@/types/workflow'

interface FlowCanvasProps {
    nodes: Node<BaseNodeData>[]
    edges: Edge[]
    onNodesChange: OnNodesChange
    onEdgesChange: OnEdgesChange
    onConnect: OnConnect
    onNodeClick: (event: React.MouseEvent, node: Node<BaseNodeData>) => void
    onNodeDoubleClick: (event: React.MouseEvent, node: Node<BaseNodeData>) => void
    onNodeDrag: (event: React.MouseEvent, node: Node<BaseNodeData>, nodes: Node<BaseNodeData>[]) => void
    onNodeDragStop: (event: React.MouseEvent, node: Node<BaseNodeData>, nodes: Node<BaseNodeData>[]) => void
    onPaneClick: () => void
    nodeTypes: NodeTypes
    edgeTypes: EdgeTypes
    defaultEdgeOptions: DefaultEdgeOptions
    canvasMode: 'select' | 'pan'
    setCanvasMode: (mode: 'select' | 'pan') => void
    onSelectionChange: (params: OnSelectionChangeParams) => void
    setShowNodePanel: (show: boolean) => void
    isExecuting: boolean
    onExecute: () => void
    zoomIn: () => void
    zoomOut: () => void
    fitView: () => void
}

export const FlowCanvas = memo(({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onNodeDoubleClick,
    onNodeDrag,
    onNodeDragStop,
    onPaneClick,
    nodeTypes,
    edgeTypes,
    defaultEdgeOptions,
    canvasMode,
    setCanvasMode,
    onSelectionChange,
    setShowNodePanel,
    isExecuting,
    onExecute,
    zoomIn,
    zoomOut,
    fitView
}: FlowCanvasProps) => {

    return (
        <div className="flex-1 relative bg-background flex flex-col h-full">
            <div className="flex-1 relative h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onNodeDoubleClick={onNodeDoubleClick}
                    onNodeDrag={onNodeDrag}
                    onNodeDragStop={onNodeDragStop}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    fitView
                    className="bg-background"
                    edgesUpdatable={true}
                    edgesFocusable={true}
                    nodesDraggable={true}
                    nodesConnectable={true}
                    elementsSelectable={true}
                    selectionOnDrag={canvasMode === 'select'}
                    panOnDrag={canvasMode === 'pan' ? true : [1, 2]}
                    selectionMode={SelectionMode.Partial}
                    multiSelectionKeyCode={['Meta', 'Control']}
                    onSelectionChange={onSelectionChange}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color="#374151"
                        className="opacity-50"
                    />

                    {/* Mode Toggle & Zoom Controls - Bottom Left */}
                    <Panel position="bottom-left" className="ml-3 mb-3">
                        <div className="flex flex-col gap-1.5">
                            {/* Mode Toggle */}
                            <div className="flex flex-col p-1 bg-card border border-border rounded-lg">
                                <button
                                    onClick={() => setCanvasMode('select')}
                                    className={`p-1.5 rounded transition-colors ${canvasMode === 'select'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                        }`}
                                    title="Select Mode (V)"
                                >
                                    <MousePointer2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => setCanvasMode('pan')}
                                    className={`p-1.5 rounded transition-colors ${canvasMode === 'pan'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                        }`}
                                    title="Pan Mode (H)"
                                >
                                    <Hand className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Zoom Controls */}
                            <div className="flex flex-col p-1 bg-card border border-border rounded-lg">
                                <button
                                    onClick={zoomIn}
                                    className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={fitView}
                                    className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                                    title="Fit View"
                                >
                                    <Maximize className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={zoomOut}
                                    className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </Panel>

                    {/* Add Node Button - Top Right */}
                    <Panel position="top-right" className="mr-3 mt-3">
                        <Button
                            onClick={() => setShowNodePanel(true)}
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </Panel>

                    {/* Execute Button - Bottom Center */}
                    <Panel position="bottom-center" className="mb-4">
                        <Button
                            onClick={onExecute}
                            disabled={isExecuting}
                            className="h-9 px-4 rounded-lg text-sm font-medium"
                        >
                            {isExecuting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                            )}
                            {isExecuting ? 'Running...' : 'Execute Workflow'}
                        </Button>
                    </Panel>

                    {/* Empty State - Add First Step */}
                    {nodes.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="flex flex-col items-center gap-3 pointer-events-auto">
                                <button
                                    onClick={() => setShowNodePanel(true)}
                                    className="group flex flex-col items-center justify-center gap-4 w-48 h-48 rounded-2xl border-2 border-dashed border-border/60 hover:border-primary hover:bg-muted/30 transition-all duration-300"
                                >
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                        Add first step...
                                    </span>
                                </button>
                                <button
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline decoration-dotted underline-offset-4"
                                >
                                    or start from a template
                                </button>
                            </div>
                        </div>
                    )}
                </ReactFlow>
            </div>
        </div>
    )
})

FlowCanvas.displayName = 'FlowCanvas'
