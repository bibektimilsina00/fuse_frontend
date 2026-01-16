import * as React from 'react'
import { Card } from '@/components/ui/Card'

export const AuthForm: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Card className="w-full max-w-md">
                {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
                {children}
            </Card>
        </div>
    )
}
