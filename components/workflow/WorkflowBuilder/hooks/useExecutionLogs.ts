import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react'
import { useWorkflowWebSocket } from './useWorkflowWebSocket'

export interface LogEntry {
    id: string
    timestamp: string
    type: 'info' | 'success' | 'error' | 'warning'
    message: string
    nodeId?: string
    data?: any
}

export function useExecutionLogs(nodes: any[], setNodes: Dispatch<SetStateAction<any[]>>, toast: any) {
    const [logs, setLogs] = useState<LogEntry[]>([])

    // Keep a ref to nodes to access them in effects without dependency cycles
    const nodesRef = useRef(nodes)
    useEffect(() => {
        nodesRef.current = nodes
    }, [nodes])

    const handleMessage = useCallback((message: any) => {
        if (!message) return

        const timestamp = new Date().toISOString()
        const currentNodes = nodesRef.current

        if (message.type === 'node_started') {
            const { node_id, input_data } = message.data
            // Update node status
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === node_id || n.data.node_id === node_id) {
                        return { ...n, data: { ...n.data, status: 'running' } }
                    }
                    return n
                })
            )
            // Add log
            const node = currentNodes.find(n => n.id === node_id || n.data.node_id === node_id)
            setLogs(prev => [...prev, {
                id: Math.random().toString(36).substring(7),
                timestamp,
                type: 'info',
                message: `Starting node: ${node?.data?.label || node_id}`,
                nodeId: node_id,
                data: input_data
            }])

        } else if (message.type === 'node_completed') {
            const { node_id, result } = message.data
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === node_id || n.data.node_id === node_id) {
                        return { ...n, data: { ...n.data, status: 'success', output: result } }
                    }
                    return n
                })
            )
            const node = currentNodes.find(n => n.id === node_id || n.data.node_id === node_id)
            setLogs(prev => [...prev, {
                id: Math.random().toString(36).substring(7),
                timestamp,
                type: 'success',
                message: `Node completed: ${node?.data?.label || node_id}`,
                nodeId: node_id,
                data: result
            }])

        } else if (message.type === 'node_failed') {
            const { node_id, error, error_category, error_suggestion, is_retryable } = message.data
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === node_id || n.data.node_id === node_id) {
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                status: 'failed',
                                error,
                                errorCategory: error_category,
                                errorSuggestion: error_suggestion
                            }
                        }
                    }
                    return n
                })
            )
            const node = currentNodes.find(n => n.id === node_id || n.data.node_id === node_id)

            // Build enhanced error message
            let errorMessage = `Node failed: ${node?.data?.label || node_id}`
            if (error_category && error_category !== 'unknown') {
                errorMessage += ` [${error_category.replace(/_/g, ' ')}]`
            }
            errorMessage += `. ${error}`

            setLogs(prev => [...prev, {
                id: Math.random().toString(36),
                timestamp,
                type: 'error',
                message: errorMessage,
                nodeId: node_id,
                data: error_suggestion ? { suggestion: error_suggestion, is_retryable } : undefined
            }])

            // Show suggestion toast if available
            if (error_suggestion) {
                toast({
                    title: `💡 Suggestion`,
                    description: error_suggestion,
                    variant: 'default'
                })
            }

        } else if (message.type === 'node_retrying') {
            const { node_id, attempt, max_attempts, delay_seconds } = message.data
            const node = currentNodes.find(n => n.id === node_id || n.data.node_id === node_id)
            setLogs(prev => [...prev, {
                id: Math.random().toString(36),
                timestamp,
                type: 'warning',
                message: `Retrying node: ${node?.data?.label || node_id} (attempt ${attempt}/${max_attempts}, waiting ${delay_seconds}s)`,
                nodeId: node_id
            }])

        } else if (message.type === 'node_continued') {
            const { node_id, error } = message.data
            const node = currentNodes.find(n => n.id === node_id || n.data.node_id === node_id)
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === node_id || n.data.node_id === node_id) {
                        return { ...n, data: { ...n.data, status: 'warning', error } }
                    }
                    return n
                })
            )
            setLogs(prev => [...prev, {
                id: Math.random().toString(36),
                timestamp,
                type: 'warning',
                message: `Node failed but workflow continues: ${node?.data?.label || node_id}. Error: ${error}`,
                nodeId: node_id
            }])

        } else if (message.type === 'workflow_completed') {
            toast({
                title: "Workflow Completed",
                description: "All nodes executed successfully.",
            })
            setLogs(prev => [...prev, {
                id: Math.random().toString(36),
                timestamp,
                type: 'success',
                message: `Workflow execution completed successfully.`,
            }])

        } else if (message.type === 'workflow_failed') {
            toast({
                title: "Workflow Failed",
                description: message.data.error,
                variant: "destructive"
            })
            setLogs(prev => [...prev, {
                id: Math.random().toString(36),
                timestamp,
                type: 'error',
                message: `Workflow execution failed. Error: ${message.data.error}`,
            }])
        } else if (message.type === 'workflow_started') {
            setLogs(prev => [...prev, {
                id: Math.random().toString(36),
                timestamp,
                type: 'info',
                message: `Workflow execution started.`,
            }])
        }
    }, [setNodes, toast])

    return { logs, setLogs, handleMessage }
}
