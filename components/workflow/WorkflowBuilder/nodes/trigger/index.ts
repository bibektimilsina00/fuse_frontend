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

export { WhatsAppTriggerNode } from './WhatsAppTriggerNode'
export { EmailTriggerNode } from './EmailTriggerNode'
export { GenericTriggerNode } from './GenericTriggerNode'
