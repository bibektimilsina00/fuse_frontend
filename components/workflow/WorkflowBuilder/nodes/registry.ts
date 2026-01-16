import {
    GenericTriggerNode,
    WhatsAppTriggerNode,
    EmailTriggerNode,
    GenericActionNode,
    GoogleSheetsNode,
    EmailActionNode,
    PythonCodeNode,
    GenericLogicNode,
    BaseNode
} from './index'

// Node types must match the backend Python node definitions exactly
export const NODE_TYPES_MAP = {
    // === TRIGGERS ===
    'manual.trigger': GenericTriggerNode,
    'schedule.cron': GenericTriggerNode,
    'webhook.receive': GenericTriggerNode,
    'email.receive': EmailTriggerNode,
    'form.submit': GenericTriggerNode,
    'rss.read': GenericTriggerNode, // Trigger type
    'whatsapp.receive': WhatsAppTriggerNode,

    // === ACTIONS ===
    'google_sheets.read': GoogleSheetsNode,
    'google_sheets.write': GoogleSheetsNode,
    'email.send': EmailActionNode,
    'code.python': PythonCodeNode,
    'code.javascript': PythonCodeNode,
    'discord.send': GenericActionNode,
    'slack.send': GenericActionNode,
    'whatsapp.send': GenericActionNode,
    'http.request': GenericActionNode,
    'data.store': GenericActionNode,
    'data.set': GenericActionNode,
    'data.transform': GenericActionNode,

    // === AI ===
    'ai.agent': GenericActionNode,
    'ai.llm': GenericActionNode,

    // === LOGIC ===
    'condition.if': GenericLogicNode,
    'condition.switch': GenericLogicNode,
    'execution.pause': GenericLogicNode,
    'logic.loop': GenericLogicNode,
    'logic.delay': GenericLogicNode,
    'logic.merge': GenericLogicNode,
    'logic.parallel': GenericLogicNode,
    'utility.noop': GenericLogicNode,

    // === GENERIC FALLBACKS ===
    trigger: GenericTriggerNode,
    action: GenericActionNode,
    logic: GenericLogicNode,
    default: BaseNode,
}

