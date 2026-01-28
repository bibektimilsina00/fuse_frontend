import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const inputVariants = cva(
    'flex h-10 w-full rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
    {
        variants: {
            size: {
                sm: 'h-8 px-3 text-xs',
                md: 'h-10 px-4 text-sm',
                lg: 'h-12 px-6 text-base',
            },
        },
        defaultVariants: { size: 'md' },
    }
)

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, size, ...props }, ref) => {
    return <input ref={ref} className={twMerge(inputVariants({ size }), className)} {...props} />
})
Input.displayName = 'Input'
