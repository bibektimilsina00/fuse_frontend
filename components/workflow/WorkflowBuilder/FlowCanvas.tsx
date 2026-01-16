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
                        gap={16}
                        size={1.5}
                        color="#d1d5db"
                        className="dark:opacity-30"
                    />

                    {/* Mode Toggle & Zoom Controls */}
                    <Panel position="bottom-left" className="ml-4 mb-4">
                        <div className="flex flex-col items-center gap-2">
                            {/* Mode Toggle */}
                            <div className="flex flex-col items-center gap-1 p-1 bg-card/90 backdrop-blur-xl border border-border rounded-lg shadow-lg">
                                <button
                                    onClick={() => setCanvasMode('select')}
                                    className={`p-1.5 rounded-md transition-all active:scale-95 ${canvasMode === 'select' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                                    title="Select Mode (V)"
                                >
                                    <MousePointer2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => setCanvasMode('pan')}
                                    className={`p-1.5 rounded-md transition-all active:scale-95 ${canvasMode === 'pan' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                                    title="Pan Mode (H)"
                                >
                                    <Hand className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Zoom Controls */}
                            <div className="flex flex-col items-center gap-1 p-1 bg-card/90 backdrop-blur-xl border border-border rounded-lg shadow-lg">
                                <button
                                    onClick={zoomIn}
                                    className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-all active:scale-95"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={fitView}
                                    className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-all active:scale-95"
                                    title="Fit View"
                                >
                                    <Maximize className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={zoomOut}
                                    className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-all active:scale-95"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </Panel>

                    {/* Add Node Button on Top Right */}
                    <Panel position="top-right" className="mr-4 mt-4">
                        <Button
                            onClick={() => setShowNodePanel(true)}
                            className="p-0 h-10 w-10 rounded-xl shadow-xl hover:scale-105 transition-transform"
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </Panel>

                    {/* Execute Button on Bottom Center */}
                    <Panel position="bottom-center" className="mb-6">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                onClick={onExecute}
                                disabled={isExecuting}
                                className="rounded-xl px-6 py-2.5 bg-primary hover:bg-primary/90 border-b-2 border-primary-dark shadow-xl hover:shadow-primary/20 h-auto font-semibold text-sm flex items-center gap-2.5 transition-all duration-150 active:border-b-0 active:translate-y-[1px]"
                            >
                                {isExecuting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                )}
                                {isExecuting ? 'Running...' : 'Execute Workflow'}
                            </Button>
                        </motion.div>
                    </Panel>

                    {/* Empty State - Add First Step */}
                    {nodes.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-3 pointer-events-auto">
                                <button
                                    onClick={() => setShowNodePanel(true)}
                                    className="group flex flex-col items-center gap-2 p-8 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all"
                                >
                                    <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                        <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">Add first step...</span>
                                </button>
                                <a
                                    href="/workflows"
                                    className="text-xs text-primary hover:underline"
                                >
                                    or start from a template
                                </a>
                            </motion.div>
                        </div>
                    )}
                </ReactFlow>
            </div>
        </div>
    )
})

FlowCanvas.displayName = 'FlowCanvas'
