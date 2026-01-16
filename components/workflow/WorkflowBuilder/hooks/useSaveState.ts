import { useState, useEffect, useCallback, useRef } from 'react'
import { useSaveWorkflow } from '@/services/queries/workflows'
import type { Node, Edge } from 'reactflow'
import type {
    WorkflowMeta,
    ExecutionConfig,
    ObservabilityConfig,
    AIMetadata,
    BaseNodeData,
    NodeKind,
    WorkflowEdgeV2,
    WorkflowNodeV2
} from '@/types/workflow'

interface UseSaveStateProps {
    workflowId: string
    nodes: Node<BaseNodeData>[]
    edges: Edge[]
    meta?: WorkflowMeta
    execution?: ExecutionConfig
    observability?: ObservabilityConfig
    aiMetadata?: AIMetadata
    onSaveSuccess?: (isAutoSave?: boolean) => void
    onSaveError?: (error: Error | unknown) => void
    autoSaveDelay?: number // milliseconds
    autoSaveEnabled?: boolean
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useSaveState({
    workflowId,
    nodes,
    edges,
    meta,
    execution,
    observability,
    aiMetadata,
    onSaveSuccess,
    onSaveError,
    autoSaveDelay = 3000, // 3 seconds default
    autoSaveEnabled = true
}: UseSaveStateProps) {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
    const [isDirty, setIsDirty] = useState(false)
    const [lastSavedState, setLastSavedState] = useState<string>('')
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
    const savedIndicatorTimerRef = useRef<NodeJS.Timeout | null>(null)

    const saveWorkflow = useSaveWorkflow()

    // Calculate current state hash
    const getCurrentStateHash = useCallback(() => {
        return JSON.stringify({ nodes, edges, meta, execution, observability })
    }, [nodes, edges, meta, execution, observability])

    // Check if state has changed
    useEffect(() => {
        const currentHash = getCurrentStateHash()
        if (lastSavedState && currentHash !== lastSavedState) {
            setIsDirty(true)
            setSaveStatus('idle')
        }
    }, [nodes, edges, meta, execution, observability, lastSavedState, getCurrentStateHash])

    // Manual save function
    const handleSave = useCallback(async (isAutoSave = false) => {
        if (!workflowId) return

        setSaveStatus('saving')
        setIsDirty(false)

        try {
            // Arrays to track problematic nodes for logging
            const unknownNodes: { id: string; name: string }[] = []
            const missingPosNodes: string[] = []

            // Map ReactFlow format back to V2 format for backend
            const v2Nodes: WorkflowNodeV2[] = nodes.map(n => {
                const nodeData = n.data as BaseNodeData
                // These are now required by BaseNodeData interface
                const nodeName = nodeData.node_name
                const position = n.position // position is required in Node type from reactflow (usually)

                if (nodeName === 'unknown' || nodeName === 'default') {
                    unknownNodes.push({ id: n.id, name: nodeName })
                }

                if (!position) {
                    missingPosNodes.push(n.id)
                }

                return {
                    id: n.id,
                    kind: nodeData.type as NodeKind,
                    ui: {
                        label: nodeData.label,
                        position: position
                    },
                    spec: {
                        ...nodeData.spec,
                        node_name: nodeName,
                        config: nodeData.config,
                        settings: nodeData.settings
                    }
                }
            })

            // Guard: Don't save if nodes are invalid (unknown type or missing position)
            if ((unknownNodes.length > 0 || missingPosNodes.length > 0) && isAutoSave) {
                const debugInfo = {
                    unknownTypeNodes: unknownNodes,
                    missingPositionNodes: missingPosNodes,
                    // Log the first few problematic nodes for inspection
                    sampleProblematicNodes: nodes
                        .filter(n => unknownNodes.some(u => u.id === n.id) || missingPosNodes.includes(n.id))
                        .slice(0, 3)
                        .map(n => ({
                            id: n.id,
                            type: n.type,
                            hasPosition: !!n.position,
                            dataKeys: Object.keys(n.data || {}),
                            nodeName: n.data?.node_name,
                            specNodeName: n.data?.spec?.node_name
                        }))
                };
                console.warn('[Save] Skipping auto-save due to invalid node state:', debugInfo);
                setSaveStatus('idle');
                return
            }

            const v2Edges: WorkflowEdgeV2[] = edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceHandle: e.sourceHandle,
                targetHandle: e.targetHandle,
                condition: typeof e.label === 'string' ? e.label : undefined // Map label back to condition
            }))

            // Ensure execution has all required fields with proper defaults
            const defaultExecution = {
                mode: 'async',
                timeout_seconds: 300,
                retry: { max_attempts: 3, strategy: 'exponential' },
                concurrency: 1
            }
            const mergedExecution = execution
                ? {
                    ...defaultExecution,
                    ...execution,
                    retry: { ...defaultExecution.retry, ...(execution.retry || {}) }
                }
                : defaultExecution

            await saveWorkflow.mutateAsync({
                workflow_id: workflowId,
                meta: meta || {
                    id: workflowId,
                    name: 'Workflow',
                    status: 'draft',
                    version: '1.0.0',
                    tags: []
                },
                graph: {
                    nodes: v2Nodes,
                    edges: v2Edges
                },
                execution: mergedExecution,
                observability: observability || { logging: true, metrics: true, tracing: false },
                ai: aiMetadata || { generated_by: 'ui' }
            })

            const currentHash = getCurrentStateHash()
            setLastSavedState(currentHash)
            setSaveStatus('saved')
            onSaveSuccess?.(isAutoSave)

            // Clear "saved" indicator after 3 seconds
            if (savedIndicatorTimerRef.current) {
                clearTimeout(savedIndicatorTimerRef.current)
            }
            savedIndicatorTimerRef.current = setTimeout(() => {
                setSaveStatus('idle')
            }, 3000)
        } catch (error) {
            setSaveStatus('error')
            setIsDirty(true)
            onSaveError?.(error)
        }
    }, [workflowId, nodes, edges, meta, execution, observability, aiMetadata, saveWorkflow, onSaveSuccess, onSaveError, getCurrentStateHash])

    // Auto-save effect
    useEffect(() => {
        if (!isDirty || !workflowId || !autoSaveEnabled) return

        // Clear existing timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current)
        }

        // Set new timer
        autoSaveTimerRef.current = setTimeout(() => {
            handleSave(true)
        }, autoSaveDelay)

        // Cleanup
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }
        }
    }, [isDirty, workflowId, handleSave, autoSaveDelay, autoSaveEnabled])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }
            if (savedIndicatorTimerRef.current) {
                clearTimeout(savedIndicatorTimerRef.current)
            }
        }
    }, [])

    // Initialize last saved state
    useEffect(() => {
        if (!lastSavedState && nodes.length > 0) {
            setLastSavedState(getCurrentStateHash())
        }
    }, [nodes, edges, lastSavedState, getCurrentStateHash])

    return {
        saveStatus,
        isDirty,
        isSaving: saveStatus === 'saving',
        handleSave,
    }
}
