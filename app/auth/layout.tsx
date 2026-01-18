export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex items-center justify-center min-h-screen p-4">
                {children}
            </div>
        </div>
    )
}
