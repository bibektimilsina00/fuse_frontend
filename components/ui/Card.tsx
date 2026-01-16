import * as React from 'react'

export const Card: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = '', children }) => {
    return (
        <div className={`bg-card text-card-foreground border border-border rounded-lg shadow-sm p-6 transition-all hover:shadow-md ${className}`}>
            {children}
        </div>
    )
}