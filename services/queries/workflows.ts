import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    workflowApi,
    type CreateWorkflowRequest,
    type UpdateWorkflowRequest,
    type SaveWorkflowRequest,
    type AIWorkflowRequest,
} from '../api/workflows'
import type { WorkflowV2 } from '@/types/workflow'

export const workflowKeys = {
    all: ['workflows'] as const,
    lists: () => [...workflowKeys.all, 'list'] as const,
    list: (filters?: string) => [...workflowKeys.lists(), { filters }] as const,
    details: () => [...workflowKeys.all, 'detail'] as const,
    detail: (id: string) => [...workflowKeys.details(), id] as const,
    nodeTypes: () => [...workflowKeys.all, 'node-types'] as const,
    nodeOptions: (nodeType: string, methodName: string, deps: Record<string, unknown>) =>
        [...workflowKeys.all, 'node-options', nodeType, methodName, deps] as const,
    debugWorkflows: () => [...workflowKeys.all, 'debug'] as const,
    debugWorkflow: (filename: string) => [...workflowKeys.all, 'debug', filename] as const,
}

export function useWorkflows() {
    return useQuery({
        queryKey: workflowKeys.lists(),
        queryFn: workflowApi.getWorkflows,
    })
}

export function useWorkflow(id: string) {
    return useQuery({
        queryKey: workflowKeys.detail(id),
        queryFn: () => workflowApi.getWorkflow(id),
        enabled: !!id,
    })
}

export function useNodeTypes() {
    return useQuery({
        queryKey: workflowKeys.nodeTypes(),
        queryFn: workflowApi.getNodeTypes,
        staleTime: 0, // Disable caching to ensure schema updates are reflected immediately
    })
}

export function useCreateWorkflow() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateWorkflowRequest) => workflowApi.createWorkflow(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
        },
    })
}

export function useUpdateWorkflow() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateWorkflowRequest }) =>
            workflowApi.updateWorkflow(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
        },
    })
}

export function useDeleteWorkflow() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => workflowApi.deleteWorkflow(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
        },
    })
}

export function useSaveWorkflow() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: SaveWorkflowRequest) => workflowApi.saveWorkflow(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.workflow_id) })
            queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
        },
    })
}

export function useExecuteWorkflow() {
    return useMutation({
        mutationFn: (id: string) => workflowApi.executeWorkflow(id),
    })
}

export function useGenerateWorkflowWithAI() {
    return useMutation({
        mutationFn: (data: AIWorkflowRequest) => workflowApi.generateWithAI(data),
    })
}

export function useExecuteNode() {
    return useMutation({
        mutationFn: ({ workflowId, nodeId, inputData }: { workflowId: string; nodeId: string; inputData?: any }) =>
            workflowApi.executeNode(workflowId, nodeId, inputData),
    })
}

export function useActivateWorkflow() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => workflowApi.activateWorkflow(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: workflowKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
        },
    })
}

export function useDeactivateWorkflow() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => workflowApi.deactivateWorkflow(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: workflowKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
        },
    })
}

// =============================================================================
// Node Options Hooks (for dynamic dropdowns)
// =============================================================================

export function useNodeOptions(
    nodeType: string,
    methodName: string,
    dependencyValues: Record<string, unknown> = {},
    enabled = true
) {
    return useQuery({
        queryKey: workflowKeys.nodeOptions(nodeType, methodName, dependencyValues),
        queryFn: () => workflowApi.getNodeOptions(nodeType, methodName, dependencyValues),
        enabled: enabled && !!nodeType && !!methodName,
        staleTime: 30 * 1000, // 30 seconds - options can change frequently
    })
}

export function useNodeOptionsMutation() {
    return useMutation({
        mutationFn: ({ nodeType, methodName, dependencyValues }: {
            nodeType: string
            methodName: string
            dependencyValues?: Record<string, unknown>
        }) => workflowApi.getNodeOptions(nodeType, methodName, dependencyValues || {}),
    })
}

// =============================================================================
// Code Execution Hooks
// =============================================================================

export function useExecuteCode() {
    return useMutation({
        mutationFn: ({ code, language, inputData }: {
            code: string
            language: string
            inputData?: Record<string, unknown>
        }) => workflowApi.executeCode(code, language, inputData || {}),
    })
}

// =============================================================================
// Debug Workflows Hooks (for development/testing)
// =============================================================================

export function useDebugWorkflows() {
    return useQuery({
        queryKey: workflowKeys.debugWorkflows(),
        queryFn: workflowApi.getDebugWorkflows,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useDebugWorkflow(filename: string) {
    return useQuery({
        queryKey: workflowKeys.debugWorkflow(filename),
        queryFn: () => workflowApi.getDebugWorkflow(filename),
        enabled: !!filename,
    })
}

export function useLoadDebugWorkflow() {
    return useMutation({
        mutationFn: (filename: string) => workflowApi.getDebugWorkflow(filename) as Promise<WorkflowV2>,
    })
}
