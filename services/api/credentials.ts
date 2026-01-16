import { apiClient } from './client'

// =============================================================================
// Credential Types
// =============================================================================

export interface Credential {
    id: string
    name: string
    type: string
    data: Record<string, string>
    created_at: string
}

export interface CreateCredentialRequest {
    name: string
    type: string
    data: Record<string, string>
}

export interface UpdateCredentialRequest {
    name?: string
    data?: Record<string, string>
}

// =============================================================================
// Credentials API
// =============================================================================

export const credentialsApi = {
    async getCredentials(): Promise<Credential[]> {
        return apiClient.get<Credential[]>('/credentials/')
    },

    async getCredential(id: string): Promise<Credential> {
        return apiClient.get<Credential>(`/credentials/${id}`)
    },

    async createCredential(data: CreateCredentialRequest): Promise<Credential> {
        return apiClient.post<Credential>('/credentials/', data)
    },

    async updateCredential(id: string, data: UpdateCredentialRequest): Promise<Credential> {
        return apiClient.patch<Credential>(`/credentials/${id}`, data)
    },

    async deleteCredential(id: string): Promise<void> {
        return apiClient.delete<void>(`/credentials/${id}`)
    },

    // OAuth callback handling
    async getOAuthUrl(credentialType: string): Promise<{ url: string }> {
        return apiClient.get<{ url: string }>(`/credentials/oauth/${credentialType}/url`)
    },
}
