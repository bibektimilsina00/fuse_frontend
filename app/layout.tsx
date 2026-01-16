import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/theme'
import { QueryProvider, AuthProvider } from '@/components/providers'
import { Toaster } from '@/components/ui/Toaster'
import '@/styles/globals.css'

const font = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Fuse',
    description: 'Build and automate powerful workflows',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={font.className} suppressHydrationWarning>
                <ThemeProvider>
                    <QueryProvider>
                        <AuthProvider>
                            {children}
                            <Toaster />
                        </AuthProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
