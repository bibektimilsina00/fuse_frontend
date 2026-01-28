/**
 * Node Components Export
 * 
 * All nodes use custom components organized by type:
 * - trigger/: Trigger node components
 * - action/: Action node components
 * - ai/: AI node components
 * - logic/: Logic node components
 * 
 * Each node must specify ui_config.component in backend to map to the correct component.
 */

// Custom Trigger Nodes
export { GenericTriggerNode } from './trigger'

// Custom Action Nodes
export { GenericActionNode, BaseActionNode } from './action'

// Custom AI Nodes
export { AIAgentNode } from './ai'

// Custom Logic Nodes
export { GenericLogicNode, BaseLogicNode } from './logic'

// Base Node for actions, ai, logic
export { BaseNode } from './BaseNode'
export { CircularNode } from './core'
export type { BaseNodeData, BaseNodeProps } from './BaseNode'

// Node Configuration Panel
export { NodeConfigPanel } from './NodeConfigPanel'
export { NodeDetailsModal } from './NodeDetailsModal'
