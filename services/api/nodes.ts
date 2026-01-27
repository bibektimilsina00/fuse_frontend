import { client } from './client'

export interface NodeInputSchema {
    name: string
    type: string
    label: string
    required?: boolean
    default?: any
    options?: { label: string, value: any }[]
    description?: string
}

export interface NodeOutputSchema {
    name: string
    type: string
    label: string
    description?: string
}

export interface NodeManifest {
    id: string
    name: string
    version: string
    category: string
    description: string
    inputs: NodeInputSchema[]
    outputs: NodeOutputSchema[]
    tags: string[]
}

export interface NodeResponse {
    id: string
    name: string
    version: string
    category: string
    description: string
    manifest: NodeManifest
    is_custom: boolean
    path: string
    has_icon: boolean
}

export interface CreateNodeRequest {
    manifest: NodeManifest
    code: string
}

export interface UpdateNodeRequest {
    manifest?: NodeManifest
    code?: string
}

export const nodesApi = {
    list: async (): Promise<NodeResponse[]> => {
        const response = await client.get('/api/v1/nodes/')
        return response.data
    },

    get: async (nodeId: string): Promise<any> => {
        const response = await client.get(`/api/v1/nodes/${nodeId}`)
        return response.data
    },

    create: async (data: CreateNodeRequest): Promise<any> => {
        const response = await client.post('/api/v1/nodes/create', data)
        return response.data
    },

    update: async (nodeId: string, data: UpdateNodeRequest): Promise<any> => {
        const response = await client.put(`/api/v1/nodes/${nodeId}`, data)
        return response.data
    },

    delete: async (nodeId: string): Promise<any> => {
        const response = await client.delete(`/api/v1/nodes/${nodeId}`)
        return response.data
    },

    uploadIcon: async (nodeId: string, file: File): Promise<any> => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await client.post(`/api/v1/nodes/${nodeId}/icon`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    }
}
