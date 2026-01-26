import { apiClient } from './client'
import type {
    WorkflowNodeV2,
    WorkflowEdgeV2,
    WorkflowMeta,
    ExecutionConfig,
    ObservabilityConfig,
    AIMetadata,
    NodeTypeInput,
    NodeTypeOutput,
    WorkflowExecution
} from '@/types/workflow'

// =============================================================================
// Workflow Types (aligned with backend V2 schema)
// =============================================================================

export interface WorkflowNode {
    id: string
    type: string
    position: { x: number; y: number }
    data: Record<string, unknown>
}

export interface WorkflowEdge {
    id: string
    source: string
    target: string
    type?: string
}

export interface RetryConfig {
    max_retries: number
    backoff_factor: number
}

export interface Workflow {
    id: string
    owner_id: string
    meta: {
        id: string
        name: string
        description?: string
        version: string
        status: 'active' | 'inactive' | 'draft'
        tags: string[]
        created_at: string
        updated_at: string
    }
    graph: {
        nodes: WorkflowNodeV2[]
        edges: WorkflowEdgeV2[]
    }
    execution: {
        mode: string
        timeout_seconds: number
        retry: RetryConfig
        concurrency: number
    }
    observability: {
        logging: boolean
        metrics: boolean
        tracing: boolean
    }
    ai: {
        generated_by: string
        confidence?: number
        prompt_version?: string
    }
}

export interface CreateWorkflowRequest {
    name: string
    description?: string
}

export interface UpdateWorkflowRequest {
    name?: string
    description?: string
    status?: 'active' | 'inactive' | 'draft'
}

export interface SaveWorkflowRequest {
    workflow_id: string
    meta: WorkflowMeta
    graph: {
        nodes: WorkflowNodeV2[]
        edges: WorkflowEdgeV2[]
    }
    execution: ExecutionConfig
    observability: ObservabilityConfig
    ai: AIMetadata
}

export interface AIWorkflowRequest {
    prompt: string
    current_nodes?: WorkflowNodeV2[]
    current_edges?: WorkflowEdgeV2[]
    model?: string
    credentialId?: string
}

export interface AIWorkflowResponse {
    nodes: WorkflowNodeV2[]
    edges: WorkflowEdgeV2[]
    suggestions?: string[]
}

export interface NodeType {
    name: string
    label: string
    type: string
    icon: string
    description: string
    inputs: NodeTypeInput[]
    outputs: NodeTypeOutput[]
    category: string
}

export interface ExecuteNodeRequest {
    input_data: Record<string, unknown>
    config?: Record<string, unknown>
}

export interface ExecuteNodeResponse {
    status: 'completed' | 'failed'
    result?: Record<string, unknown>
    error?: string
    node_id: string
}

export const workflowApi = {
    async getWorkflows(): Promise<Workflow[]> {
        const response = await apiClient.get<{ data: Workflow[], count: number }>('/workflows/')
        return response.data
    },

    async getWorkflow(id: string): Promise<Workflow> {
        return apiClient.get<Workflow>(`/workflows/${id}`)
    },

    async createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
        return apiClient.post<Workflow>('/workflows/', data)
    },

    async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
        return apiClient.patch<Workflow>(`/workflows/${id}`, data)
    },

    async deleteWorkflow(id: string): Promise<void> {
        return apiClient.delete<void>(`/workflows/${id}`)
    },

    async saveWorkflow(data: SaveWorkflowRequest): Promise<Workflow> {
        const { workflow_id, ...rest } = data
        console.log('[DEBUG] Save workflow request:', JSON.stringify(rest, null, 2))
        return apiClient.post<Workflow>(`/workflows/${workflow_id}/save`, rest)
    },

    async executeWorkflow(id: string): Promise<WorkflowExecution> {
        return apiClient.post<WorkflowExecution>(`/workflows/${id}/execute`)
    },

    async getNodeTypes(): Promise<NodeType[]> {
        return apiClient.get<NodeType[]>('/workflows/nodes/types')
    },

    async generateWithAI(data: AIWorkflowRequest): Promise<AIWorkflowResponse> {
        // Convert camelCase credentialId to snake_case credential_id for backend
        const requestData = {
            prompt: data.prompt,
            current_nodes: data.current_nodes,
            current_edges: data.current_edges,
            model: data.model,
            credential_id: data.credentialId  // Convert to snake_case
        }
        return apiClient.post<AIWorkflowResponse>('/ai/generate', requestData)
    },

    async executeNode(workflowId: string, nodeId: string, inputData: Record<string, unknown> = {}): Promise<ExecuteNodeResponse> {
        return apiClient.post<ExecuteNodeResponse>(`/workflows/${workflowId}/nodes/${nodeId}/execute`, { input_data: inputData })
    },

    async activateWorkflow(id: string): Promise<Workflow> {
        return apiClient.post<Workflow>(`/workflows/${id}/activate`)
    },

    async deactivateWorkflow(id: string): Promise<Workflow> {
        return apiClient.post<Workflow>(`/workflows/${id}/deactivate`)
    },

    // Node options for dynamic dropdowns
    async getNodeOptions(nodeType: string, methodName: string, dependencyValues: Record<string, unknown> = {}): Promise<Array<{ label: string; value: string }>> {
        return apiClient.post<Array<{ label: string; value: string }>>('/workflows/node/options', {
            node_type: nodeType,
            method_name: methodName,
            dependency_values: dependencyValues
        })
    },

    // Code execution
    async executeCode(code: string, language: string, inputData: Record<string, unknown> = {}): Promise<{ output: string; error?: string }> {
        return apiClient.post<{ output: string; error?: string }>('/workflows/execute-code', {
            code,
            language,
            input_data: inputData
        })
    },

    // Debug workflows (dummy JSON files)
    async getDebugWorkflows(): Promise<string[]> {
        return apiClient.get<string[]>('/workflows/debug/workflows')
    },

    async getDebugWorkflow(filename: string): Promise<unknown> {
        return apiClient.get<unknown>(`/workflows/debug/workflows/${filename}`)
    },
}

// Alias for backwards compatibility
export const workflowsApi = workflowApi
