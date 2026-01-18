'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRegister, useLogin } from '@/services/queries/auth'

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const registerMutation = useRegister()
    const loginMutation = useLogin()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await registerMutation.mutateAsync({
                email,
                password,
                full_name: fullName || undefined,
            })

            // Auto-login after successful registration
            await loginMutation.mutateAsync({ email, password })
            router.push('/dashboard')
        } catch (error) {
            console.error('Registration failed:', error)
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
                    Create your account
                </h1>
            </div>

            {/* Register Form */}
            <div className="bg-card border border-border rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {registerMutation.isError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-500">
                                {registerMutation.error?.message || 'Registration failed. Please try again.'}
                            </p>
                        </div>
                    )}

                    {registerMutation.isSuccess && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-emerald-500">
                                Account created! Signing you in...
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-muted-foreground mb-1.5">
                            Name
                        </label>
                        <Input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>

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
                            minLength={8}
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">
                            At least 8 characters
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending || loginMutation.isPending}
                    >
                        {registerMutation.isPending || loginMutation.isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Creating account...
                            </div>
                        ) : (
                            'Create account'
                        )}
                    </Button>
                </form>
            </div>

            {/* Sign in link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <Link
                    href="/auth/login"
                    className="text-primary hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </div>
    )
}
