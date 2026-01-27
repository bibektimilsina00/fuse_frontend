/**
 * Trigger Nodes Export
 * 
 * All trigger nodes extend BaseTriggerNode and share the inverted-D shape design.
 * Each trigger customizes:
 * - Icon and color
 * - Connection logic
 * - Details content
 */

export { BaseTriggerNode } from './BaseTriggerNode'
export type { BaseTriggerNodeData, TriggerNodeConfig } from './BaseTriggerNode'

export { GenericTriggerNode } from './GenericTriggerNode'
