import { useEffect, useRef, useState } from 'react'
import { wsLogger } from '@/lib/logger'
import type { NodeStatus } from '@/types/workflow'

interface WebSocketMessageData {
    nodeId?: string
    nodeName?: string
    status?: NodeStatus
    input?: Record<string, unknown>
    output?: Record<string, unknown>
    error?: string
    executionId?: string
    [key: string]: unknown
}

interface WebSocketMessage {
    type: string
    timestamp: string
    data: WebSocketMessageData
}

export function useWorkflowWebSocket(executionId: string | null, onMessage?: (message: WebSocketMessage) => void) {
    const [isConnected, setIsConnected] = useState(false)
    const socketRef = useRef<WebSocket | null>(null)
    const onMessageRef = useRef(onMessage)

    // Keep callback ref updated
    useEffect(() => {
        onMessageRef.current = onMessage
    }, [onMessage])

    useEffect(() => {
        if (!executionId) return

        // Close existing connection if any
        if (socketRef.current) {
            socketRef.current.close()
        }

        const wsUrl = `ws://localhost:8000/api/v1/workflows/ws/${executionId}`
        const socket = new WebSocket(wsUrl)
        socketRef.current = socket

        socket.onopen = () => {
            wsLogger.debug('Connected', { executionId })
            setIsConnected(true)
        }

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data)
                if (onMessageRef.current) {
                    onMessageRef.current(message)
                }
            } catch (e) {
                wsLogger.error('Failed to parse message', e)
            }
        }

        socket.onclose = () => {
            wsLogger.debug('Disconnected', { executionId })
            setIsConnected(false)
        }

        socket.onerror = (error) => {
            wsLogger.error('Connection error', error)
        }

        return () => {
            socket.close()
        }
    }, [executionId])

    return { isConnected }
}

