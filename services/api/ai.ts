import { apiClient } from './client'

export interface AIChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export interface AIChatRequest {
    message: string
    model?: string
    credential_id?: string
    history?: AIChatMessage[]
}

export interface AIChatResponse {
    response: string
}

export interface AIModel {
    id: string
    label: string
    provider: string
    description?: string
    speed?: string
    quality?: string
    cost?: string
}

export const aiApi = {
    generateWorkflow: async (data: {
        prompt: string,
        model?: string,
        current_nodes?: any[],
        current_edges?: any[],
        credential_id?: string
    }) => {
        const response = await apiClient.post('/ai/generate', data)
        return response as any
    },

    chat: async (data: AIChatRequest): Promise<AIChatResponse> => {
        const response = await apiClient.post<AIChatResponse>('/ai/chat', data)
        return response as any // Cast to avoid Axios/Wrapper type ambiguity
    },

    getModels: async (credentialId?: string): Promise<AIModel[]> => {
        const query = credentialId ? `?credential_id=${encodeURIComponent(credentialId)}` : ''
        const response = await apiClient.get<AIModel[]>(`/ai/models${query}`)
        return response
    }
}
