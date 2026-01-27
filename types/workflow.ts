/**
 * Workflow Types
 * 
 * Comprehensive type definitions for the V2 workflow schema.
 * Use these types instead of `any` throughout the codebase.
 */

// =============================================================================
// Node Status & Kinds
// =============================================================================

export type NodeStatus = 'idle' | 'pending' | 'running' | 'success' | 'failed' | 'warning'

export type NodeKind = 'trigger' | 'action' | 'logic' | 'ai'

export type WorkflowStatus = 'draft' | 'active' | 'inactive' | 'archived'

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

// =============================================================================
// Node Configuration
// =============================================================================

export interface NodePosition {
    x: number
    y: number
}

export interface NodeSettings {
    alwaysOutputData?: boolean
    executeOnce?: boolean
    retryOnFail?: boolean
    onError?: 'stop' | 'continue' | 'retry'
    notes?: string
    displayNoteInFlow?: boolean
    retry?: {
        maxAttempts?: number
        waitBetweenTries?: number
    }
}

export interface NodeSpec {
    node_name: string
    runtime: {
        type: 'internal' | 'external' | 'code'
    }
    config: Record<string, unknown>
    settings: NodeSettings
}

export interface NodeUI {
    label: string
    icon?: string
    position: NodePosition
}

// =============================================================================
// V2 Workflow Schema - Nodes & Edges
// =============================================================================

export interface WorkflowNodeV2 {
    id: string
    kind: NodeKind
    ui: NodeUI
    spec: NodeSpec
}

export interface WorkflowEdgeV2 {
    id: string
    source: string
    target: string
    source_handle?: string | null
    target_handle?: string | null
    sourceHandle?: string | null
    targetHandle?: string | null
    condition?: string
}

export interface WorkflowGraph {
    nodes: WorkflowNodeV2[]
    edges: WorkflowEdgeV2[]
}

// =============================================================================
// V2 Workflow Metadata
// =============================================================================

export interface WorkflowOwner {
    user_id: string
    team_id?: string
}

export interface WorkflowMeta {
    id: string
    name: string
    description?: string
    version?: string
    status: WorkflowStatus
    tags?: string[]
    owner?: WorkflowOwner
    created_at?: string
    updated_at?: string
}

// =============================================================================
// V2 Execution & Observability Config
// =============================================================================

export interface ExecutionConfig {
    mode?: 'sync' | 'async' | string
    timeout_seconds?: number
    retry?: {
        max_attempts: number
        strategy: string
    }
    concurrency?: number
}

export interface ObservabilityConfig {
    logging: boolean
    metrics: boolean
    tracing?: boolean
}

export interface AIMetadata {
    generated_by?: string
    model?: string
    prompt_tokens?: number
}

// =============================================================================
// Complete V2 Workflow
// =============================================================================

export interface WorkflowV2 {
    id: string
    owner_id: string
    meta: WorkflowMeta
    graph: WorkflowGraph
    execution: ExecutionConfig
    observability: ObservabilityConfig
    ai?: AIMetadata
}

// =============================================================================
// React Flow Node/Edge Data (Frontend-specific)
// =============================================================================

export interface BaseNodeData {
    id: string
    label: string
    description?: string
    node_name: string
    type: string // This stores the NodeKind (trigger, action, logic, ai)
    status?: NodeStatus
    config: Record<string, unknown>
    spec: NodeSpec
    settings: NodeSettings
    workflowId?: string
    executeNode?: (nodeId?: string) => Promise<void>
    output?: unknown
    lastResult?: unknown
    icon_svg?: string
}

export interface TriggerNodeData extends BaseNodeData {
    kind: 'trigger'
}

export interface ActionNodeData extends BaseNodeData {
    kind: 'action'
}

export interface LogicNodeData extends BaseNodeData {
    kind: 'logic'
}

export type WorkflowNodeData = TriggerNodeData | ActionNodeData | LogicNodeData | BaseNodeData

// =============================================================================
// Execution Types
// =============================================================================

export interface WorkflowExecution {
    id: string
    workflow_id: string
    status: ExecutionStatus
    started_at: string
    completed_at?: string
    error?: string
    trigger_data?: string
}

export interface NodeExecution {
    id: string
    workflow_execution_id: string
    node_id: string
    node_type: string
    status: ExecutionStatus
    started_at: string
    completed_at?: string
    input_data?: string
    output_data?: string
    error?: string
}

// =============================================================================
// Log Entry Types
// =============================================================================

export interface LogEntry {
    id: string
    timestamp: string
    type: 'workflow_started' | 'workflow_completed' | 'workflow_failed' |
    'node_started' | 'node_completed' | 'node_failed' |
    'node_retrying' | 'node_continued'
    nodeId?: string
    nodeName?: string
    message: string
    status?: NodeStatus
    data?: {
        input?: unknown
        output?: unknown
        error?: string
        category?: string
        suggestion?: string
        retryCount?: number
    }
}

// =============================================================================
// Node Type Registry (from backend)
// =============================================================================

export interface NodeTypeInput {
    name: string
    type: string
    label: string
    default?: unknown
    options?: Array<{ value: string; label: string }>
    credential_type?: string
    required?: boolean
}

export interface NodeTypeOutput {
    name: string
    type: string
}

export interface NodeTypeDefinition {
    name: string
    label: string
    description: string
    type: string // 'action' | 'trigger' | 'logic'
    icon?: string
    category: string // 'Data', 'Communication', etc.
    inputs: NodeTypeInput[]
    outputs: NodeTypeOutput[]
    credential_type?: string
    trigger_group?: string
    icon_svg?: string
}

// =============================================================================
// Legacy Types (for backwards compatibility)
// =============================================================================

/** @deprecated Use WorkflowNodeV2 instead */
export interface WorkflowNode {
    id: string
    type: 'trigger' | 'action' | 'ai' | 'condition'
    position: NodePosition
    data: {
        label: string
        description?: string
        config?: Record<string, unknown>
    }
}

/** @deprecated Use WorkflowEdgeV2 instead */
export interface WorkflowEdge {
    id: string
    source: string
    target: string
    label?: string
}

/** @deprecated Use WorkflowV2 instead */
export interface Workflow {
    id: string
    name: string
    description?: string
    status: WorkflowStatus
    nodes: WorkflowNode[]
    edges: WorkflowEdge[]
    createdAt: string
    updatedAt: string
    tags?: string[]
}

export interface WorkflowTemplate {
    id: string
    name: string
    description: string
    category: string
    icon?: string
    nodes: WorkflowNode[]
    edges: WorkflowEdge[]
}

export interface Project {
    id: string
    name: string
    description?: string
    workflows: Workflow[]
    createdAt: string
    updatedAt: string
}
