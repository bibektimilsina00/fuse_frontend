import {
    GenericTriggerNode,
    GenericActionNode,
    GenericLogicNode,
    BaseNode,
    AIAgentNode,
    CircularNode
} from './index'

// Node types must match the backend Python node definitions exactly

export const NODE_TYPES_MAP = {
    // === SPECIALIZED COMPONENTS ===
    // Only register nodes here if they need a REPLACEMENT component (not just a generic one)
    'ai.agent': AIAgentNode,



    // === GENERIC FALLBACKS ===
    trigger: GenericTriggerNode,
    action: GenericActionNode,
    logic: GenericLogicNode,
    circular: CircularNode,
    default: BaseNode,
}


