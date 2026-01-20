import { apiClient } from './client'

export interface PluginStatus {
    id: string
    name: string
    description: string
    version: string
    author: string
    icon: string
    installed: boolean
    running: boolean
    status: 'active' | 'installed' | 'not_installed' | 'error'
    can_install: boolean
    can_start: boolean
    can_login: boolean
    details?: any
}

export const pluginsApi = {
    async getPlugins(): Promise<PluginStatus[]> {
        return apiClient.get<PluginStatus[]>('/plugins/')
    },

    async getPlugin(id: string): Promise<PluginStatus> {
        return apiClient.get<PluginStatus>(`/plugins/${id}`)
    },

    async performAction(id: string, action: 'install' | 'start' | 'stop' | 'login'): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(`/plugins/${id}/action`, { action })
    }
}
