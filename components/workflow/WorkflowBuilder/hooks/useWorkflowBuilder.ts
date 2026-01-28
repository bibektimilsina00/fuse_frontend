import { useState, useCallback, useEffect, useRef } from 'react'
import { useNodesState, useEdgesState, useReactFlow, Connection, addEdge, Node, Edge, MarkerType } from 'reactflow'
import { useNodeTypes, useGenerateWorkflowWithAI, useWorkflow, useExecuteWorkflow, useExecuteNode, useActivateWorkflow, useDeactivateWorkflow } from '@/services/queries/workflows'
import { useToast } from '@/components/ui/use-toast'
import { useWorkflowWebSocket } from './useWorkflowWebSocket'
import { useExecutionLogs } from './useExecutionLogs'
import { workflowLogger } from '@/lib/logger'
import { useSaveState } from './useSaveState'
import type {
    WorkflowMeta,
    ExecutionConfig,
    ObservabilityConfig,
    AIMetadata,
    WorkflowV2,
    WorkflowNodeV2,
    WorkflowEdgeV2,
    BaseNodeData,
    NodeTypeDefinition,
    NodeKind
} from '@/types'
import { NODE_TYPES_MAP } from '../nodes/registry'

// Note: Using Node<any> for React Flow compatibility
// Type definitions in @/types provide documentation for the expected structure
interface UseWorkflowBuilderProps {
    initialNodes?: Node[]
    initialEdges?: Edge[]
    workflowId?: string
}

export function useWorkflowBuilder({
    initialNodes = [],
    initialEdges = [],
    workflowId
}: UseWorkflowBuilderProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
    const { fitView, zoomIn, zoomOut, getNodes } = useReactFlow()
    const { toast } = useToast()
    const { data: availableNodeTypes = [] } = useNodeTypes()

    // 2. History & Clipboard
    const [historyState, setHistoryState] = useState<{
        items: Array<{ nodes: Node[], edges: Edge[] }>,
        index: number
    }>({
        items: [],
        index: -1
    })
    const isInternalStateChange = useRef(false)
    const [clipboard, setClipboard] = useState<Node | null>(null)

    const saveStateToHistory = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
        if (isInternalStateChange.current) {
            isInternalStateChange.current = false
            return
        }
        const newPoint = JSON.parse(JSON.stringify({ nodes: currentNodes, edges: currentEdges }))
        setHistoryState(prev => {
            const nextItems = [...prev.items.slice(0, prev.index + 1), newPoint]
            return {
                items: nextItems.slice(-50),
                index: Math.min(nextItems.length - 1, 49) + 1 // +1 because we added a new item
            }
        })
    }, [])

    const undo = useCallback(() => {
        setHistoryState(prev => {
            if (prev.index > 0) {
                isInternalStateChange.current = true
                const nextIndex = prev.index - 1
                const prevState = prev.items[nextIndex]
                setNodes(prevState.nodes)
                setEdges(prevState.edges)
                return { ...prev, index: nextIndex }
            }
            return prev
        })
    }, [setNodes, setEdges])

    const redo = useCallback(() => {
        setHistoryState(prev => {
            if (prev.index < prev.items.length - 1) {
                isInternalStateChange.current = true
                const nextIndex = prev.index + 1
                const nextState = prev.items[nextIndex]
                setNodes(nextState.nodes)
                setEdges(nextState.edges)
                return { ...prev, index: nextIndex }
            }
            return prev
        })
    }, [setNodes, setEdges])

    // 3. UI State
    const [activeTab, setActiveTab] = useState('editor')
    const [showChat, setShowChat] = useState(false)
    const [showNodePanel, setShowNodePanel] = useState(false)
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    // 4. Metadata & Data Sync
    const { data: workflowData } = useWorkflow(workflowId || '')
    const [workflowMeta, setWorkflowMeta] = useState<WorkflowMeta | null>(null)
    const [executionConfig, setExecutionConfig] = useState<ExecutionConfig | null>(null)
    const [observabilityConfig, setObservabilityConfig] = useState<ObservabilityConfig | null>(null)
    const [aiMetadata, setAiMetadata] = useState<AIMetadata | null>(null)
    const [isActive, setIsActive] = useState(false)

    // Activation mutations
    const activateWorkflow = useActivateWorkflow()
    const deactivateWorkflow = useDeactivateWorkflow()

    const loadV2Workflow = useCallback((data: Partial<WorkflowV2>) => {
        setWorkflowMeta((data.meta as WorkflowMeta) || null)
        setExecutionConfig(data.execution || null)
        setObservabilityConfig(data.observability || null)
        setAiMetadata(data.ai || null)
        setIsActive(data.meta?.status === 'active')

        const nextNodes = data.graph?.nodes?.map((n: WorkflowNodeV2) => {
            // Find global node type metadata if available
            const nodeName = n.spec?.node_name
            const nodeType = (availableNodeTypes as NodeTypeDefinition[])?.find(t => t.name === nodeName)

            // For ReactFlow, use 'default' if node_name is unknown/undefined
            // This ensures proper rendering while preserving the actual node_name in data
            let reactFlowType = (nodeName && nodeName !== 'unknown') ? nodeName : 'default'

            // If it's an auxiliary node (Model, Tool, Memory), use CircularNode unless it has a specialized component
            if (nodeType?.connectionType === 'auxiliary' && !(NODE_TYPES_MAP as Record<string, any>)[reactFlowType]) {
                reactFlowType = 'circular'
            }

            if (!n.spec || !n.ui || !n.ui.position) {
                console.error('CRITICAL: Malformed node data from backend', n)
            }

            return {
                id: n.id,
                type: reactFlowType,
                position: n.ui.position,
                data: {
                    id: n.id,
                    label: n.ui.label,
                    node_name: nodeName,
                    type: n.kind,
                    config: n.spec.config,
                    settings: n.spec.settings,
                    spec: n.spec,
                    workflowId,
                    executeNode: (nodeId?: string) => handleExecuteNode(nodeId || n.id),
                    icon_svg: nodeType?.icon_svg
                }
            }
        }) || []

        const nextEdges = data.graph?.edges?.map((e: WorkflowEdgeV2) => ({
            ...e,
            id: e.id || `edge-${e.source}-${e.target}`,
            sourceHandle: e.source_handle || (e as any).sourceHandle || (e.condition?.toLowerCase()) || undefined,
            targetHandle: e.target_handle || (e as any).targetHandle || undefined,
            label: e.condition
        })) || []

        setNodes(nextNodes)
        setEdges(nextEdges)
        saveStateToHistory(nextNodes, nextEdges)
        setTimeout(() => fitView(), 100)
    }, [workflowId, fitView, setNodes, setEdges, saveStateToHistory, availableNodeTypes])

    const lastLoadedId = useRef<string | null>(null)
    useEffect(() => {
        if (workflowData && (workflowId !== lastLoadedId.current)) {
            // Cast strictly to unknown then Partial<WorkflowV2> to handle legacy/v2 transition
            loadV2Workflow(workflowData as unknown as Partial<WorkflowV2>)
            lastLoadedId.current = workflowId || 'new'
        }
    }, [workflowData, workflowId, loadV2Workflow])

    // 5. Interaction Handlers
    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => {
            const nextEdges = addEdge({
                ...params,
                type: 'custom',
                animated: false,
                style: { stroke: '#9ca3af', strokeWidth: 3 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af', width: 14, height: 14 },
                deletable: true
            }, eds)
            saveStateToHistory(nodes, nextEdges)
            return nextEdges
        })
    }, [nodes, setEdges, saveStateToHistory])

    const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
        saveStateToHistory(nodes, edges)
    }, [nodes, edges, saveStateToHistory])

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node)
        setShowNodePanel(false)
    }, [])

    const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node)
        setIsDetailsModalOpen(true)
    }, [])

    const onNodeUpdate = useCallback((nodeId: string, newData: Partial<BaseNodeData>) => {
        setNodes((nds) => {
            const nextNodes = nds.map((n) => {
                if (n.id === nodeId) {
                    const updatedData = { ...n.data, ...newData }

                    // Always ensure spec is in sync with config and settings
                    updatedData.spec = {
                        ...updatedData.spec,
                        config: updatedData.config,
                        settings: updatedData.settings
                    }

                    const updatedNode = { ...n, data: updatedData }
                    // Also update selectedNode if it matches
                    setSelectedNode(prev => prev?.id === nodeId ? updatedNode : prev)
                    return updatedNode
                }
                return n
            })
            saveStateToHistory(nextNodes, edges)
            return nextNodes
        })
    }, [edges, setNodes, saveStateToHistory, setSelectedNode])

    const onNodeDelete = useCallback((nodeId: string) => {
        const nextNodes = nodes.filter((n) => n.id !== nodeId)
        const nextEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
        setNodes(nextNodes)
        setEdges(nextEdges)
        saveStateToHistory(nextNodes, nextEdges)
        if (selectedNode?.id === nodeId) setSelectedNode(null)
    }, [nodes, edges, setNodes, setEdges, saveStateToHistory, selectedNode])

    const [splitEdge, setSplitEdge] = useState<{ edgeId: string, x: number, y: number } | null>(null)
    const [pendingConnection, setPendingConnection] = useState<{
        source?: string,
        sourceHandle?: string,
        target?: string,
        targetHandle?: string,
        x: number,
        y: number
    } | null>(null)

    const handleAddNode = useCallback((nodeType: any) => {
        const initialConfig = nodeType.inputs?.reduce((acc: any, input: any) => {
            if (input.default !== undefined) acc[input.name] = input.default
            return acc
        }, {}) || {}

        // Check if there is a specialized component registered for this node name (e.g. 'ai.agent')
        const specializedType = (NODE_TYPES_MAP as Record<string, any>)[nodeType.name]

        let reactFlowType = nodeType.name // Default: try the ID first (if specialized)

        if (specializedType) {
            reactFlowType = nodeType.name;
        } else if (nodeType.connectionType === 'auxiliary') {
            // If connectionType is auxiliary AND no specialized component, use circular
            reactFlowType = 'circular';
        } else {
            // Otherwise fallback to generic types (action, trigger, logic)
            reactFlowType = nodeType.type;
        }

        const newNode: Node = {
            id: `${nodeType.name}-${Date.now()}`,
            type: reactFlowType,
            position: { x: 500, y: 300 },
            data: {
                id: `${nodeType.name}-${Date.now()}`,
                label: nodeType.label,
                type: nodeType.type, // nodeType.type is action/trigger/logic
                node_name: nodeType.name,
                config: initialConfig,
                spec: {
                    node_name: nodeType.name,
                    runtime: { type: 'internal' },
                    config: initialConfig,
                    settings: {}
                },
                workflowId,
                executeNode: (nodeId?: string) => handleExecuteNode(nodeId || newNode.id),
                icon_svg: nodeType.icon_svg
            }
        }
        newNode.data.id = newNode.id

        let nextNodes = [...nodes, newNode]
        let nextEdges = [...edges]

        if (splitEdge) {
            const edge = edges.find((e) => e.id === splitEdge.edgeId)
            if (edge) {
                newNode.position = { x: splitEdge.x - 70, y: splitEdge.y - 70 }
                nextEdges = edges.filter((e) => e.id !== splitEdge.edgeId).concat([
                    { id: `edge-${edge.source}-${newNode.id}`, source: edge.source, target: newNode.id, type: 'custom' },
                    { id: `edge-${newNode.id}-${edge.target}`, source: newNode.id, target: edge.target, type: 'custom' }
                ])
            }
            setSplitEdge(null)
        } else if (pendingConnection) {

            if (pendingConnection.source) {
                newNode.position = { x: pendingConnection.x, y: pendingConnection.y }
                nextEdges = [...edges, {
                    id: `edge-${pendingConnection.source}-${newNode.id}`,
                    source: pendingConnection.source,
                    sourceHandle: pendingConnection.sourceHandle,
                    target: newNode.id,
                    type: 'custom'
                }]
            } else if (pendingConnection.target) {
                // Reverse connection: NewNode -> Node
                newNode.position = { x: pendingConnection.x, y: pendingConnection.y }
                nextEdges = [...edges, {
                    id: `edge-${newNode.id}-${pendingConnection.target}`,
                    source: newNode.id,
                    target: pendingConnection.target,
                    targetHandle: pendingConnection.targetHandle,
                    type: 'custom'
                }]
            }

            setPendingConnection(null)
        }

        setNodes(nextNodes)
        setEdges(nextEdges)
        saveStateToHistory(nextNodes, nextEdges)
        setShowNodePanel(false)
    }, [nodes, edges, splitEdge, pendingConnection, workflowId, setNodes, setEdges, saveStateToHistory])

    // 6. AI Chat & Execution
    const generateWithAI = useGenerateWorkflowWithAI()
    const [chatMessage, setChatMessage] = useState('')
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai', message: string }>>([])
    const [selectedAiModel, setSelectedAiModel] = useState('openai/gpt-4o-mini')
    const [selectedAiCredentialId, setSelectedAiCredentialId] = useState<string>('')


    const handleSendChat = useCallback(async (prompt?: string, model?: string, credentialId?: string) => {
        const messageToSend = prompt || chatMessage
        if (!messageToSend.trim()) return

        setChatMessage('')
        setChatHistory((prev) => [...prev, { role: 'user', message: messageToSend }])
        setIsAiLoading(true)

        try {
            const v2Nodes: WorkflowNodeV2[] = nodes.map(n => ({
                id: n.id,
                kind: (n.data?.type as NodeKind) || 'action',
                ui: {
                    label: n.data?.label || 'Node',
                    icon: n.data?.spec?.ui?.icon,
                    position: n.position
                },
                spec: {
                    ...n.data?.spec,
                    config: n.data?.config || {},
                    settings: n.data?.settings || {}
                }
            }))
            const v2Edges: WorkflowEdgeV2[] = edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceHandle: e.sourceHandle,
                targetHandle: e.targetHandle,
                condition: typeof e.label === 'string' ? e.label : undefined
            }))
            const response = await generateWithAI.mutateAsync({
                prompt: messageToSend,
                current_nodes: v2Nodes,
                current_edges: v2Edges,
                model: model || selectedAiModel,
                credentialId: credentialId || selectedAiCredentialId || undefined
            })
            const aiMsg = response.suggestions?.join('\n') || 'Workflow updated with generated nodes.'
            setChatHistory((prev) => [...prev, { role: 'ai', message: aiMsg }])
            if (response.nodes && response.edges) {
                // Apply the generated nodes and edges
                setNodes((prevNodes) => [...prevNodes, ...response.nodes.map((n, idx) => ({
                    id: n.id,
                    type: n.spec.node_name,
                    position: n.ui.position,
                    data: {
                        id: n.id,
                        label: n.ui.label,
                        type: n.kind,
                        node_name: n.spec.node_name,
                        config: n.spec.config,
                        settings: n.spec.settings,
                        spec: n.spec,
                        workflowId,
                        executeNode: (nodeId?: string) => handleExecuteNode(nodeId || n.id)
                    }
                }))])
                setEdges((prevEdges) => [...prevEdges, ...response.edges.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    label: e.condition
                }))])
            }
        } catch (error) {
            setChatHistory((prev) => [...prev, { role: 'ai', message: 'Error generating workflow.' }])
        } finally {
            setIsAiLoading(false)
        }
    }, [chatMessage, nodes, edges, generateWithAI, loadV2Workflow])

    const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
    const [clipboardNodes, setClipboardNodes] = useState<Node[]>([])

    const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
        setSelectedNodes(nodes)
        // If single node selected, update selectedNode for backward compat with UI panels
        if (nodes.length === 1) {
            setSelectedNode(nodes[0])
        } else if (nodes.length === 0) {
            setSelectedNode(null)
            setShowNodePanel(false)
        }
    }, [])

    const copySelection = useCallback(() => {
        if (selectedNodes.length === 0) return
        setClipboardNodes(JSON.parse(JSON.stringify(selectedNodes)))
        toast({
            title: "Copied",
            description: `${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''} copied to clipboard`
        })
    }, [selectedNodes, toast])

    const pasteSelection = useCallback(() => {
        if (clipboardNodes.length === 0) return

        const timestamp = Date.now()
        const newNodes = clipboardNodes.map((node) => {
            const newNodeId = `${node.data.node_name}-${timestamp}-${Math.random().toString(36).substr(2, 6)}`
            return {
                ...node,
                id: newNodeId,
                position: { x: node.position.x + 50, y: node.position.y + 50 },
                selected: true,
                data: {
                    ...node.data,
                    id: newNodeId, // Assign new ID directly
                }
            }
        })

        // Correct the ID in data
        newNodes.forEach(n => n.data.id = n.id)

        const nextNodes = [
            ...nodes.map(n => ({ ...n, selected: false })),
            ...newNodes
        ]

        setNodes(nextNodes)
        setSelectedNodes(newNodes)
        if (newNodes.length === 1) setSelectedNode(newNodes[0])

        saveStateToHistory(nextNodes, edges)
        toast({
            title: "Pasted",
            description: `Pasted ${newNodes.length} node${newNodes.length > 1 ? 's' : ''}`
        })
    }, [clipboardNodes, nodes, edges, setNodes, toast, saveStateToHistory])

    const executeWorkflow = useExecuteWorkflow()
    const executeNode = useExecuteNode()
    const [isExecuting, setIsExecuting] = useState(false)
    const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null)
    const { logs, setLogs, handleMessage: baseHandleMessage } = useExecutionLogs(nodes, setNodes, toast)
    const handleMessage = useCallback((message: any) => {
        baseHandleMessage(message)
        if (message.type === 'workflow_completed' || message.type === 'workflow_failed') setIsExecuting(false)
    }, [baseHandleMessage])
    const { isConnected } = useWorkflowWebSocket(currentExecutionId, handleMessage)

    const handleExecute = useCallback(async () => {
        if (!workflowId) return
        setIsExecuting(true)
        setLogs([])
        setNodes((nds) => nds.map(n => ({ ...n, data: { ...n.data, status: 'pending' } })))
        try {
            const execution = await executeWorkflow.mutateAsync(workflowId)
            setCurrentExecutionId(execution.id)
            toast({ title: "Workflow Started", description: "The workflow execution has been queued." })
        } catch (error) {
            setIsExecuting(false)
            toast({ title: "Execution Failed", description: "Failed to start workflow execution.", variant: "destructive" })
        }
    }, [workflowId, executeWorkflow, toast, setNodes, setLogs])

    const handleExecuteNode = useCallback(async (nodeId: string, overrideConfig?: any, inputData: any = {}) => {
        if (!workflowId) return
        setIsExecuting(true)

        // Use passed config override or find in latest nodes from React Flow (prevents stale closures)
        const config = overrideConfig || getNodes().find(n => n.id === nodeId)?.data?.config || {}

        workflowLogger.debug(`Executing node ${nodeId}`, { config, inputData })

        setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'pending' } } : n))
        try {
            const payload = {
                input_data: inputData,
                config: config
            }
            workflowLogger.debug('Sending payload', payload)

            const result = await executeNode.mutateAsync({
                workflowId,
                nodeId,
                inputData: payload
            })
            setNodes((nds) => {
                const updatedNodes = nds.map(n => n.id === nodeId ? {
                    ...n,
                    data: { ...n.data, status: 'success', output: result, lastResult: result }
                } : n)

                // Update selectedNode if it's the one that was executed
                const updatedNode = updatedNodes.find(n => n.id === nodeId)
                if (updatedNode) {
                    setSelectedNode(prev => prev?.id === nodeId ? updatedNode : prev)
                }

                return updatedNodes
            })
            setIsExecuting(false)
            toast({ title: "Node Executed", description: "The node execution completed successfully." })
        } catch (error: any) {
            console.error("DEBUG: Node execution failed", error)
            setNodes((nds) => {
                const updatedNodes = nds.map(n => n.id === nodeId ? {
                    ...n,
                    data: { ...n.data, status: 'failed', error: error.message || "Failed to execute node." }
                } : n)

                // Update selectedNode if it matches
                const updatedNode = updatedNodes.find(n => n.id === nodeId)
                if (updatedNode) {
                    setSelectedNode(prev => prev?.id === nodeId ? updatedNode : prev)
                }

                return updatedNodes
            })
            setIsExecuting(false)
            toast({
                title: "Node Execution Failed",
                description: error.message || "Failed to execute node.",
                variant: "destructive"
            })
        }
    }, [workflowId, executeNode, toast, setNodes, getNodes])

    // 6. Save State Management
    const { saveStatus, isDirty, isSaving, handleSave } = useSaveState({
        workflowId: workflowId || '',
        nodes,
        edges,
        meta: workflowMeta || undefined,
        execution: executionConfig || undefined,
        observability: observabilityConfig || undefined,
        aiMetadata: aiMetadata || undefined,
        autoSaveEnabled: true,
        autoSaveDelay: 1500
    })

    // 7. Workflow Metadata Updates
    const updateWorkflowMeta = useCallback((updates: Partial<WorkflowMeta>) => {
        setWorkflowMeta((prev) => (prev ? { ...prev, ...updates } : prev))
    }, [])

    const toggleActive = useCallback(async () => {
        if (!workflowId) return
        try {
            if (isActive) {
                await deactivateWorkflow.mutateAsync(workflowId)
                setIsActive(false)
                updateWorkflowMeta({ status: 'inactive' })
                toast({ title: 'Workflow Deactivated', description: 'Triggers are now disabled.' })
            } else {
                await activateWorkflow.mutateAsync(workflowId)
                setIsActive(true)
                updateWorkflowMeta({ status: 'active' })
                toast({ title: 'Workflow Activated', description: 'Triggers are now listening!' })
            }
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to toggle workflow status.', variant: 'destructive' })
        }
    }, [workflowId, isActive, activateWorkflow, deactivateWorkflow, updateWorkflowMeta, toast])

    return {
        // Node / Edge State
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeClick,
        onNodeDoubleClick,
        onNodeDragStop,
        onNodeDrag: () => { },
        selectedNode,
        setSelectedNode,
        selectedNodes,
        onSelectionChange,

        // UI Tabs & Panels
        activeTab,
        setActiveTab,
        showChat,
        setShowChat,
        showNodePanel,
        setShowNodePanel,
        isDetailsModalOpen,
        setIsDetailsModalOpen,

        // Settings & Meta
        isActive,
        toggleActive,
        workflowMeta,
        executionConfig,
        observabilityConfig,
        aiMetadata,
        updateWorkflowMeta,
        loadV2Workflow,

        // Actions
        availableNodeTypes,
        onNodeUpdate,
        onNodeDelete,
        handleAddNode,
        undo,
        redo,
        copyNode: copySelection,
        pasteNode: pasteSelection,
        canUndo: historyState.index > 0,
        canRedo: historyState.index < historyState.items.length - 1,

        // AI & Execution
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

        // Connections
        splitEdge,
        setSplitEdge,
        pendingConnection,
        setPendingConnection,

        // Save State
        saveStatus,
        isDirty,
        isSaving,
        handleSave
    }
}
