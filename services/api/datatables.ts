import { apiClient as api } from './client'

export interface ColumnDefinition {
    id: string
    name: string
    type: 'string' | 'number' | 'boolean' | 'date' | 'json'
    required: boolean
    unique: boolean
    indexed: boolean
    defaultValue?: string
    description?: string
}

export interface DataTable {
    id: string
    name: string
    description?: string
    schema_definition: ColumnDefinition[]
    created_at: string
    updated_at: string
    owner_id: string
    _count?: {
        rows: number
    }
}

export interface DataTableRow {
    id: string
    table_id: string
    data: Record<string, any>
    created_at: string
    updated_at: string
}

export const datatablesApi = {
    getTables: async (): Promise<DataTable[]> => {
        return api.get('/datatables/')
    },

    getTable: async (id: string): Promise<DataTable> => {
        return api.get(`/datatables/${id}`)
    },

    createTable: async (data: { name: string; description?: string; schema_definition: ColumnDefinition[] }): Promise<DataTable> => {
        return api.post('/datatables/', data)
    },

    updateTable: async (id: string, data: Partial<DataTable>): Promise<DataTable> => {
        return api.patch(`/datatables/${id}`, data)
    },

    deleteTable: async (id: string): Promise<void> => {
        await api.delete(`/datatables/${id}`)
    },

    // --- Row Operations ---

    getRows: async (tableId: string): Promise<DataTableRow[]> => {
        return api.get(`/datatables/${tableId}/rows`)
    },

    createRow: async (tableId: string, data: Record<string, any>): Promise<DataTableRow> => {
        return api.post(`/datatables/${tableId}/rows`, { data })
    },

    updateRow: async (tableId: string, rowId: string, data: Record<string, any>): Promise<DataTableRow> => {
        return api.patch(`/datatables/${tableId}/rows/${rowId}`, { data })
    },

    deleteRow: async (tableId: string, rowId: string): Promise<void> => {
        await api.delete(`/datatables/${tableId}/rows/${rowId}`)
    }
}
