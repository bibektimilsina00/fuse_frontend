import { logger } from '@/lib/logger'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
export const API_V1 = `${API_URL}/api/v1`

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Retry configuration for API requests
 */
interface RetryConfig {
    maxRetries: number
    baseDelayMs: number
    maxDelayMs: number
    retryableStatuses: number[]
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, Rate limit, Server errors
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoff(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt)
    const jitter = Math.random() * 0.3 * exponentialDelay // Add up to 30% jitter
    return Math.min(exponentialDelay + jitter, config.maxDelayMs)
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if an error is retryable
 */
function isRetryableError(status: number, config: RetryConfig): boolean {
    return config.retryableStatuses.includes(status)
}

export class ApiClient {
    private static instance: ApiClient
    private token: string | null = null
    private retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG

    private constructor() {
        // Load token from localStorage if available
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('auth_token')
        }
    }

    static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient()
        }
        return ApiClient.instance
    }

    setToken(token: string | null) {
        this.token = token
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('auth_token', token)
            } else {
                localStorage.removeItem('auth_token')
            }
        }
    }

    getToken(): string | null {
        return this.token
    }

    /**
     * Configure retry behavior
     */
    setRetryConfig(config: Partial<RetryConfig>) {
        this.retryConfig = { ...this.retryConfig, ...config }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        retryCount = 0
    ): Promise<T> {
        // Generate request ID for tracing (only on first attempt)
        const requestId = retryCount === 0 ? generateRequestId() : (options.headers as Record<string, string>)?.['X-Request-ID']

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
            ...(options.headers as Record<string, string>),
        }

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`
        }

        try {
            const response = await fetch(`${API_V1}${endpoint}`, {
                ...options,
                headers,
            })

            // Handle rate limiting with Retry-After header
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After')
                if (retryAfter && retryCount < this.retryConfig.maxRetries) {
                    const delayMs = parseInt(retryAfter, 10) * 1000 || calculateBackoff(retryCount, this.retryConfig)
                    logger.warn(`Rate limited on ${endpoint}. Retrying after ${delayMs}ms (attempt ${retryCount + 1})`)
                    await sleep(delayMs)
                    return this.request<T>(endpoint, options, retryCount + 1)
                }
            }

            // Handle other retryable errors
            if (!response.ok && isRetryableError(response.status, this.retryConfig) && retryCount < this.retryConfig.maxRetries) {
                const delayMs = calculateBackoff(retryCount, this.retryConfig)
                logger.warn(`Request failed with ${response.status} on ${endpoint}. Retrying after ${delayMs}ms (attempt ${retryCount + 1})`)
                await sleep(delayMs)
                return this.request<T>(endpoint, options, retryCount + 1)
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
                throw new Error(error.detail || `HTTP error! status: ${response.status}`)
            }

            return response.json()
        } catch (error) {
            // Retry on network errors
            if (error instanceof TypeError && error.message === 'Failed to fetch' && retryCount < this.retryConfig.maxRetries) {
                const delayMs = calculateBackoff(retryCount, this.retryConfig)
                logger.warn(`Network error on ${endpoint}. Retrying after ${delayMs}ms (attempt ${retryCount + 1})`)
                await sleep(delayMs)
                return this.request<T>(endpoint, options, retryCount + 1)
            }
            throw error
        }
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' })
    }

    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    async postFormData<T>(endpoint: string, formData: URLSearchParams): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/x-www-form-urlencoded',
        }

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`
        }

        const response = await fetch(`${API_V1}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
            throw new Error(error.detail || `HTTP error! status: ${response.status}`)
        }

        return response.json()
    }

    async put<T>(endpoint: string, data: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async patch<T>(endpoint: string, data: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' })
    }
}

export const apiClient = ApiClient.getInstance()
