import { apiClient } from './client'

export interface AntigravityStatus {
    installed: boolean
    running: boolean
    binary_path: string | null
    config_path: string | null
    port: number
    accounts: string[]
}

export const aiApi = {
    async getAntigravityStatus(): Promise<AntigravityStatus> {
        return apiClient.get<AntigravityStatus>('/ai/antigravity/status')
    },

    async startAntigravityLogin(): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>('/ai/antigravity/login')
    }
}
