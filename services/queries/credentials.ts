import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    credentialsApi,
    type CreateCredentialRequest,
    type UpdateCredentialRequest,
} from '../api/credentials'

// =============================================================================
// Query Keys
// =============================================================================

export const credentialKeys = {
    all: ['credentials'] as const,
    lists: () => [...credentialKeys.all, 'list'] as const,
    list: (filters?: Record<string, string>) => [...credentialKeys.lists(), filters] as const,
    byType: (type: string) => [...credentialKeys.all, 'byType', type] as const,
    details: () => [...credentialKeys.all, 'detail'] as const,
    detail: (id: string) => [...credentialKeys.details(), id] as const,
}

// =============================================================================
// Query Hooks
// =============================================================================

export function useCredentials() {
    return useQuery({
        queryKey: credentialKeys.lists(),
        queryFn: credentialsApi.getCredentials,
    })
}

export function useCredentialsByType(type: string) {
    return useQuery({
        queryKey: credentialKeys.byType(type),
        queryFn: async () => {
            const credentials = await credentialsApi.getCredentials()
            return credentials.filter(c => c.type === type)
        },
        enabled: !!type,
    })
}

export function useCredential(id: string) {
    return useQuery({
        queryKey: credentialKeys.detail(id),
        queryFn: () => credentialsApi.getCredential(id),
        enabled: !!id,
    })
}

// =============================================================================
// Mutation Hooks
// =============================================================================

export function useCreateCredential() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCredentialRequest) => credentialsApi.createCredential(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: credentialKeys.lists() })
        },
    })
}

export function useUpdateCredential() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCredentialRequest }) =>
            credentialsApi.updateCredential(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: credentialKeys.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: credentialKeys.lists() })
        },
    })
}

export function useDeleteCredential() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => credentialsApi.deleteCredential(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: credentialKeys.lists() })
        },
    })
}

export function useOAuthUrl(credentialType: string) {
    return useQuery({
        queryKey: ['oauth', 'url', credentialType],
        queryFn: () => credentialsApi.getOAuthUrl(credentialType),
        enabled: false, // Only fetch when explicitly called
    })
}
