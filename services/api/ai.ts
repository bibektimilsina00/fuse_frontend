import { apiClient } from './client'

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export interface ChatRequest {
    message: string
    model?: string
    credential_id?: string
    history?: ChatMessage[]
}

export interface ChatResponse {
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
    chat: async (data: ChatRequest): Promise<ChatResponse> => {
        return apiClient.post<ChatResponse>('/ai/chat', data)
    },

    getModels: async (credentialId?: string): Promise<AIModel[]> => {
        const query = credentialId ? `?credential_id=${credentialId}` : ''
        const models = await apiClient.get<AIModel[]>(`/ai/models${query}`)

        // Enrich with defaults for UI
        return models.map(m => ({
            ...m,
            description: m.description || 'AI model',
            speed: 'Medium',
            quality: 'High',
            cost: 'Variable'
        }))
    }
}
