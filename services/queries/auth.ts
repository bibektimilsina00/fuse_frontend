import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, type LoginRequest, type RegisterRequest } from '../api/auth'

export const authKeys = {
    all: ['auth'] as const,
    currentUser: () => [...authKeys.all, 'current-user'] as const,
}

export function useCurrentUser() {
    return useQuery({
        queryKey: authKeys.currentUser(),
        queryFn: authApi.getCurrentUser,
        retry: false,
    })
}

export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
        },
    })
}

export function useRegister() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
        },
    })
}

export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => {
            authApi.logout()
            return Promise.resolve()
        },
        onSuccess: () => {
            queryClient.clear()
        },
    })
}
