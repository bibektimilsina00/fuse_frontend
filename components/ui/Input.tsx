import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const inputVariants = cva('block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100', {
    variants: {
        size: {
            sm: 'py-1.5 text-sm',
            md: 'py-2 text-sm',
            lg: 'py-3 text-base',
        },
    },
    defaultVariants: { size: 'md' },
})

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, size, ...props }, ref) => {
    return <input ref={ref} className={twMerge(inputVariants({ size }), className)} {...props} />
})
Input.displayName = 'Input'
