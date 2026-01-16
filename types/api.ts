export type Token = {
    access_token: string
    token_type: 'bearer'
}

export type UserPublic = {
    id: string
    email: string
    is_active: boolean
    is_superuser: boolean
    full_name?: string | null
}

export type RegisterPayload = {
    email: string
    password: string
    full_name?: string | null
}
