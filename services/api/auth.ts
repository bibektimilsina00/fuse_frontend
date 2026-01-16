import { apiClient, API_V1 } from './client'

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    full_name?: string
}

export interface AuthResponse {
    access_token: string
    token_type: string
}

export interface User {
    id: number
    email: string
    full_name?: string
    is_active: boolean
    is_superuser: boolean
    created_at: string
}

export const authApi = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const formData = new URLSearchParams()
        formData.append('username', credentials.email)
        formData.append('password', credentials.password)

        // Use apiClient's postFormData method for form-urlencoded requests
        const data = await apiClient.postFormData<AuthResponse>('/login/access-token', formData)
        apiClient.setToken(data.access_token)
        return data
    },

    async register(data: RegisterRequest): Promise<User> {
        return apiClient.post<User>('/register', data)
    },

    async getCurrentUser(): Promise<User> {
        return apiClient.get<User>('/users/me')
    },

    logout() {
        apiClient.setToken(null)
    },
}
