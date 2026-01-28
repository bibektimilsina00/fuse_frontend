import React from 'react'
import { Plus, Trash, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AnimatePresence, motion } from 'framer-motion'

interface CollectionInputProps {
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    disabled?: boolean
}

export function CollectionInput({ value = [], onChange, placeholder, disabled }: CollectionInputProps) {
    const handleAdd = () => {
        onChange([...value, ''])
    }

    const handleRemove = (index: number) => {
        const newValue = value.filter((_, i) => i !== index)
        onChange(newValue)
    }

    const handleChange = (index: number, val: string) => {
        const newValue = [...value]
        newValue[index] = val
        onChange(newValue)
    }

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <AnimatePresence initial={false}>
                    {value.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center gap-2"
                        >
                            <Input
                                value={item}
                                onChange={(e) => handleChange(index, e.target.value)}
                                placeholder={placeholder || `Item ${index + 1}`}
                                className="h-9"
                                disabled={disabled}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(index)}
                                disabled={disabled}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <Button
                variant="outline"
                onClick={handleAdd}
                disabled={disabled}
                className="w-full border-dashed text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5"
            >
                <Plus className="mr-2 h-3.5 w-3.5" />
                Add Item
            </Button>
        </div>
    )
}
