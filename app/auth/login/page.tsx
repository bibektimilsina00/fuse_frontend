'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLogin } from '@/services/queries/auth'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const loginMutation = useLogin()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await loginMutation.mutateAsync({ email, password })
            router.push('/dashboard')
        } catch (error) {
            console.error('Login failed:', error)
        }
    }

    return (
        <div className="w-full max-w-sm">
            {/* Logo and Brand */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6">
                    <Image
                        src="/logo.png"
                        alt="Fuse"
                        width={72}
                        height={72}
                        className="object-contain"
                    />
                </div>
                <h1 className="text-xl font-semibold text-foreground">
                    Sign in to Fuse
                </h1>
            </div>

            {/* Login Form */}
            <div className="bg-card border border-border rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {loginMutation.isError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-500">
                                {loginMutation.error?.message || 'Invalid email or password'}
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-muted-foreground mb-1.5">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-muted-foreground mb-1.5">
                            Password
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Signing in...
                            </div>
                        ) : (
                            'Sign in'
                        )}
                    </Button>
                </form>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
                New to Fuse?{' '}
                <Link
                    href="/auth/register"
                    className="text-primary hover:underline"
                >
                    Create an account
                </Link>
            </p>
        </div>
    )
}
