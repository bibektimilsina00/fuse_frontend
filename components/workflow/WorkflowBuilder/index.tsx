'use client'

import { useState, useMemo, useEffect } from 'react'
import ReactFlow, { MarkerType } from 'reactflow'
import 'reactflow/dist/style.css'
import { AnimatePresence } from 'framer-motion'

// Hooks and Services
import { useWorkflowBuilder } from './hooks/useWorkflowBuilder'
import type { SaveStatus } from './hooks/useSaveState'
import { NodeTypeDefinition } from '@/types'

// Nodes and Edges
import { NodeDetailsModal } from './nodes'
import { NODE_TYPES_MAP } from './nodes/registry'
import { GenericActionNode, GenericTriggerNode, GenericLogicNode, CircularNode } from './nodes'
import CustomEdge from './CustomEdge'

// Components
import { LogsPanel } from './LogsPanel'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { CanvasHeader } from './CanvasHeader'
import { NavSidebar } from './NavSidebar'
import { SidebarControls } from './SidebarControls'
import { NodePanel } from './NodePanel'
import { FlowCanvas } from './FlowCanvas'

// --- Configuration ---

const EDGE_TYPES_MAP = {
    custom: CustomEdge,
}

const defaultEdgeOptions = {
    type: 'custom',
    animated: false,
    style: { stroke: '#9ca3af', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af', width: 14, height: 14 },
    deletable: true,
}

export interface WorkflowBuilderProps {
    workflowId?: string
    workflowName?: string
    initialNodes?: any[]
    initialEdges?: any[]
    onNodesChange?: (nodes: any[]) => void
    onEdgesChange?: (edges: any[]) => void
    onMetaChange?: (meta: any) => void
    onExecutionChange?: (execution: any) => void
    onObservabilityChange?: (observability: any) => void
    onAiMetadataChange?: (ai: any) => void
    onSave?: () => void
    saveStatus?: SaveStatus
    isDirty?: boolean
    isSaving?: boolean
    onBack: () => void
}

export function WorkflowBuilder({
    workflowId,
    workflowName,
    initialNodes = [],
    initialEdges = [],
    onNodesChange: onNodesUpdate,
    onEdgesChange: onEdgesUpdate,
    onMetaChange,
    onExecutionChange,
    onObservabilityChange,
    onAiMetadataChange,
    onSave: onExternalSave,
    saveStatus: externalSaveStatus,
    isDirty: externalIsDirty,
    isSaving: externalIsSaving,
    onBack
}: WorkflowBuilderProps) {
    // --- Local UI State ---
    const [showNavSidebar, setShowNavSidebar] = useState(false)
    const [showLogs, setShowLogs] = useState(false)
    const [canvasMode, setCanvasMode] = useState<'select' | 'pan'>('select')
    const [searchQuery, setSearchQuery] = useState('')

    // --- Workflow Logic Hook ---
    // Moved up so we can use availableNodeTypes in nodeTypes memo
    const workflowBuilderState = useWorkflowBuilder({ initialNodes, initialEdges, workflowId })
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeClick,
        onNodeDoubleClick,
        onNodeDrag,
        onNodeDragStop,
        selectedNode,
        setSelectedNode,
        activeTab,
        setActiveTab,
        isActive,
        toggleActive,
        showNodePanel,
        setShowNodePanel,
        showChat,
        setShowChat,
        isDetailsModalOpen,
        setIsDetailsModalOpen,
        undo,
        redo,
        copyNode,
        pasteNode,
        availableNodeTypes,
        onNodeUpdate,
        onNodeDelete,
        handleAddNode,
        chatMessage,
        setChatMessage,
        chatHistory,
        isAiLoading,
        selectedAiModel,
        setSelectedAiModel,
        selectedAiCredentialId,
        setSelectedAiCredentialId,
        handleSendChat,
        fitView,
        zoomIn,
        zoomOut,
        handleExecute,
        handleExecuteNode,
        isExecuting,
        logs,
        setLogs,
        workflowMeta,
        updateWorkflowMeta,
        loadV2Workflow,
        setSplitEdge,
        setPendingConnection,
        onSelectionChange,
        // Internal save state from hook
        saveStatus,
        isDirty,
        isSaving,
        handleSave
    } = workflowBuilderState

    // Memoize types to prevent React Flow warnings
    // Dynamically extend NODE_TYPES_MAP with entries for all available backend nodes
    const nodeTypes = useMemo(() => {
        const types: Record<string, any> = { ...NODE_TYPES_MAP }

        if (availableNodeTypes) {
            availableNodeTypes.forEach((t: any) => {
                // If the node type isn't explicitly mapped in registry.ts, assign a generic component
                if (!types[t.name]) {
                    // Determine component based on node kind/category
                    if (t.type === 'trigger') {
                        types[t.name] = GenericTriggerNode
                    } else if (['AI_TOOL', 'AI_MEMORY', 'AI_CHAT_MODEL'].includes(t.category?.toUpperCase())) {
                        types[t.name] = CircularNode
                    } else if (t.type === 'logic' || t.category === 'Logic') {
                        types[t.name] = GenericLogicNode
                    } else {
                        // Default to Action
                        types[t.name] = GenericActionNode
                    }
                }
            })
        }
        return types
    }, [availableNodeTypes])

    const edgeTypes = useMemo(() => EDGE_TYPES_MAP, [])

    // Use internal save state by default, fallback to props if provided
    const activeSaveStatus = externalSaveStatus || saveStatus
    const activeIsSaving = externalIsSaving || isSaving
    const activeIsDirty = externalIsDirty || isDirty
    const onSave = onExternalSave || handleSave

    // --- Helpers ---

    const [filterType, setFilterType] = useState<any>(null)

    const handlePaneClick = () => {
        setSelectedNode(null)
        setShowNodePanel(false)
        setSearchQuery('')
        setFilterType(null)
    }

    // Listen for Quick Add Button events
    useEffect(() => {
        const handleAddNodeAfter = (e: any) => {
            const { source, handleId, target, targetHandle, x, y, filterType: ft } = e.detail || {}
            if (source || target) {
                setPendingConnection({
                    source: source || undefined,
                    sourceHandle: (source ? handleId : undefined),
                    target: target || undefined,
                    targetHandle: targetHandle || undefined,
                    x: x || 0,
                    y: y || 0
                })
                setFilterType(ft || null)
                setShowNodePanel(true)
            }
        }

        window.addEventListener('addNodeAfter', handleAddNodeAfter as EventListener)
        return () => {
            window.removeEventListener('addNodeAfter', handleAddNodeAfter as EventListener)
        }
    }, [setPendingConnection, setShowNodePanel])

    // --- Render ---

    return (
        <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
            <CanvasHeader
                workflowMeta={workflowMeta}
                updateWorkflowMeta={updateWorkflowMeta}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                showLogs={showLogs}
                setShowLogs={setShowLogs}
                isActive={isActive || false}
                toggleActive={toggleActive}
                onSave={onSave}
                isSaving={activeIsSaving}
                saveStatus={activeSaveStatus}
                isDirty={activeIsDirty}
                showNavSidebar={showNavSidebar}
                setShowNavSidebar={setShowNavSidebar}
            />

            <NavSidebar
                isOpen={showNavSidebar}
                onClose={() => setShowNavSidebar(false)}
            />

            <div className="flex-1 relative flex">
                <SidebarControls
                    showChat={showChat}
                    setShowChat={setShowChat}
                    onLoadWorkflow={loadV2Workflow}
                />

                {/* Main Canvas Area */}
                <FlowCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onNodeDoubleClick={onNodeDoubleClick}
                    onNodeDrag={onNodeDrag}
                    onNodeDragStop={onNodeDragStop}
                    onPaneClick={handlePaneClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    canvasMode={canvasMode}
                    setCanvasMode={setCanvasMode}
                    onSelectionChange={onSelectionChange}
                    setShowNodePanel={setShowNodePanel}
                    isExecuting={isExecuting}
                    onExecute={handleExecute}
                    zoomIn={zoomIn}
                    zoomOut={zoomOut}
                    fitView={fitView}
                />

                {/* Logs Panel Overlay */}
                <AnimatePresence>
                    {showLogs && (
                        <LogsPanel
                            logs={logs}
                            isOpen={showLogs}
                            onClose={() => setShowLogs(false)}
                            onClear={() => setLogs([])}
                        />
                    )}
                </AnimatePresence>

                {/* Node Selection Panel */}
                <NodePanel
                    isOpen={showNodePanel}
                    onClose={() => {
                        setShowNodePanel(false)
                        setSplitEdge(null)
                        setPendingConnection(null)
                        setFilterType(null)
                    }}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    availableNodeTypes={availableNodeTypes as NodeTypeDefinition[]}
                    onAddNode={handleAddNode}
                    isWorkflowEmpty={nodes.length === 0}
                    filterType={filterType}
                />

                {/* Node Configuration Modal */}
                <AnimatePresence>
                    {isDetailsModalOpen && selectedNode && (
                        <NodeDetailsModal
                            node={selectedNode}
                            schema={
                                (availableNodeTypes || []).find((t: any) => {
                                    const nodeName = selectedNode.data?.node_name || selectedNode.type;
                                    return t.name === nodeName || (t as any).id === nodeName;
                                }) as any || {
                                    id: selectedNode.id || 'unknown',
                                    name: selectedNode.type || 'unknown',
                                    version: '1.0.0',
                                    displayName: selectedNode.data?.label || 'Node',
                                    description: '',
                                    category: 'ACTION',
                                    inputs: [],
                                    outputs: []
                                }
                            }
                            allNodes={nodes}
                            edges={edges}
                            onSelectNode={(node) => {
                                setSelectedNode(node);
                                setIsDetailsModalOpen(true);
                            }}
                            onClose={() => setIsDetailsModalOpen(false)}
                            onUpdate={onNodeUpdate}
                            onExecute={handleExecuteNode}
                            saveStatus={saveStatus}
                            isDirty={isDirty}
                        />
                    )}
                </AnimatePresence>
            </div>

            <AIAssistant
                isOpen={showChat}
                onClose={() => setShowChat(false)}
                onCreateWorkflow={async (prompt, model, credentialId) => {
                    setChatMessage(prompt)
                    await handleSendChat(prompt, model, credentialId)
                }}
                defaultMode="create"
            />
        </div>
    )
}
