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
        return client.get<NodeResponse[]>('/nodes/')
    },

    get: async (nodeId: string): Promise<any> => {
        return client.get<any>(`/nodes/${nodeId}`)
    },

    create: async (data: CreateNodeRequest): Promise<any> => {
        return client.post<any>('/nodes/create', data)
    },

    update: async (nodeId: string, data: UpdateNodeRequest): Promise<any> => {
        return client.put<any>(`/nodes/${nodeId}`, data)
    },

    delete: async (nodeId: string): Promise<any> => {
        return client.delete<any>(`/nodes/${nodeId}`)
    },

    uploadIcon: async (nodeId: string, file: File): Promise<any> => {
        const formData = new FormData()
        formData.append('file', file)

        const token = client.getToken();
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5678'}/api/v1/nodes/${nodeId}/icon`, {
            method: 'POST',
            headers,
            body: formData
        });

        if (!res.ok) {
            throw new Error('Failed to upload icon');
        }
        return res.json();
    }
}
