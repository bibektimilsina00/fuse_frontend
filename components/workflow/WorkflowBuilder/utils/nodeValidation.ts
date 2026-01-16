/**
 * Node Validation Utilities
 * 
 * Checks if nodes have all required configuration (credentials, required fields, etc.)
 * based on the node schema definition from the backend.
 */

import { NodeTypeDefinition } from '@/types'

export interface ValidationWarning {
    type: 'credential_missing' | 'required_field_missing' | 'configuration_incomplete'
    field: string
    message: string
    severity: 'warning' | 'error'
}

export interface NodeValidationResult {
    isValid: boolean
    warnings: ValidationWarning[]
    hasCredentialIssue: boolean
    hasRequiredFieldIssue: boolean
}

/**
 * Validates a node's configuration and returns any warnings.
 * Uses the backend registry definition (nodeType) to determine required fields.
 */
export function validateNodeConfig(
    nodeName: string,
    config: Record<string, any> = {},
    spec: Record<string, any> = {},
    nodeType?: NodeTypeDefinition
): NodeValidationResult {
    const warnings: ValidationWarning[] = []

    // Get effective config (check multiple paths)
    const effectiveConfig = {
        ...spec?.config,
        ...config
    }

    if (!nodeType) {
        // Fallback for when node type definitions aren't loaded yet
        // We can't validate without the schema, so we assume valid to avoid false positives
        return {
            isValid: true,
            warnings: [],
            hasCredentialIssue: false,
            hasRequiredFieldIssue: false
        }
    }

    // 1. Check for credential requirements based on schema
    // Check if any input is of type 'credential' and required
    const credentialInputs = nodeType.inputs?.filter(input => input.type === 'credential') || []

    for (const credInput of credentialInputs) {
        if (credInput.required) {
            const value = effectiveConfig[credInput.name]

            // Check if credential specific field is missing
            const hasValue = value && value !== '' && value !== 'dummy_cred' && value !== null

            if (!hasValue) {
                warnings.push({
                    type: 'credential_missing',
                    field: credInput.name,
                    message: `${credInput.label || 'Credential'} is required`,
                    severity: 'warning'
                })
            }
        }
    }

    // 2. Check for other required fields
    const requiredInputs = nodeType.inputs?.filter(input =>
        input.type !== 'credential' &&
        input.required &&
        input.name !== 'node_name' // Skip internal fields
    ) || []

    for (const input of requiredInputs) {
        const value = effectiveConfig[input.name]
        const hasValue = value !== undefined && value !== null && value !== ''

        if (!hasValue) {
            warnings.push({
                type: 'required_field_missing',
                field: input.name,
                message: `${input.label} is required`,
                severity: 'warning'
            })
        }
    }

    return {
        isValid: warnings.length === 0,
        warnings,
        hasCredentialIssue: warnings.some(w => w.type === 'credential_missing'),
        hasRequiredFieldIssue: warnings.some(w => w.type === 'required_field_missing')
    }
}

/**
 * Gets a summary message for the validation warnings
 */
export function getValidationSummary(result: NodeValidationResult): string {
    if (result.isValid) return ''

    const issues: string[] = []
    if (result.hasCredentialIssue) {
        issues.push('Credential needed')
    }
    if (result.hasRequiredFieldIssue) {
        const count = result.warnings.filter(w => w.type === 'required_field_missing').length
        issues.push(`${count} required field${count > 1 ? 's' : ''}`)
    }

    return issues.join(', ')
}
