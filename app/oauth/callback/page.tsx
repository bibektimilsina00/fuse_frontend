'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function OAuthCallbackPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const status = searchParams.get('status')
    const credentialId = searchParams.get('id')
    const credentialName = searchParams.get('name')
    const error = searchParams.get('error')

    useEffect(() => {
        if (status === 'success') {
            // Communicate with the parent window (the one that opened the popup)
            if (window.opener) {
                window.opener.postMessage({
                    type: 'OAUTH_SUCCESS',
                    credentialId,
                    credentialName
                }, window.location.origin)

                // Small delay to show success icon before closing
                setTimeout(() => {
                    window.close()
                }, 1500)
            } else {
                // If it wasn't a popup, just redirect to workflows
                setTimeout(() => {
                    router.push('/workflows')
                }, 2000)
            }
        }
    }, [status, credentialId, credentialName, router])

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-6">
            <div className="relative">
                {status === 'success' ? (
                    <div className="flex flex-col items-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h1 className="text-2xl font-bold italic tracking-tight">Connected Successfully!</h1>
                        <p className="text-muted-foreground mt-2 font-medium">Closing this window...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <XCircle className="w-12 h-12 text-destructive" />
                        </div>
                        <h1 className="text-2xl font-bold italic tracking-tight">Authentication Failed</h1>
                        <p className="text-muted-foreground mt-2 font-medium">{error}</p>
                        <button
                            onClick={() => window.close()}
                            className="mt-6 px-4 py-2 bg-muted rounded-xl text-sm font-bold hover:bg-muted/80 transition-colors"
                        >
                            Close Window
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <h1 className="text-2xl font-bold italic tracking-tight animate-pulse">Completing Connection...</h1>
                        <p className="text-muted-foreground mt-2 font-medium">Completing secure handshake</p>
                    </div>
                )}
            </div>

            <div className="fixed bottom-8 flex flex-col items-center gap-1 opacity-20 transition-opacity hover:opacity-100">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Antigravity Secure Auth</span>
                </div>
            </div>
        </div>
    )
}
