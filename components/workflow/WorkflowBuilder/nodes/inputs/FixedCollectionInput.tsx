import React from 'react'
import { Plus, Trash, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { NodeInputV2 } from '@/types/workflow'
import { cn } from '@/lib/utils'

interface FixedCollectionInputProps {
    value: any[]
    onChange: (value: any[]) => void
    schema: {
        displayName: string
        name: string
        values: NodeInputV2[]
    }
    disabled?: boolean
}

export function FixedCollectionInput({ value = [], onChange, schema, disabled }: FixedCollectionInputProps) {
    const handleAdd = () => {
        // Create initial object with default values from schema
        const newItem = schema.values.reduce((acc, field) => {
            acc[field.name] = field.default !== undefined ? field.default : ''
            return acc
        }, {} as Record<string, any>)

        onChange([...value, newItem])
    }

    const handleRemove = (index: number) => {
        const newValue = value.filter((_, i) => i !== index)
        onChange(newValue)
    }

    const handleChange = (index: number, fieldName: string, fieldValue: any) => {
        const newValue = [...value]
        newValue[index] = { ...newValue[index], [fieldName]: fieldValue }
        onChange(newValue)
    }

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <AnimatePresence initial={false}>
                    {value.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="relative group rounded-xl border border-border/50 bg-muted/5 overflow-hidden"
                        >
                            {/* Header / Remove Button */}
                            <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemove(index)}
                                >
                                    <Trash className="h-3 w-3" />
                                </Button>
                            </div>

                            <div className="p-4 space-y-4">
                                {schema.values.map((field) => (
                                    <div key={field.name} className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            {field.label}
                                        </label>

                                        {/* Simple Field Rendering - Can be expanded recursively if needed */}
                                        {field.type === 'string' ? (
                                            <Input
                                                value={item[field.name] || ''}
                                                onChange={(e) => handleChange(index, field.name, e.target.value)}
                                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                                className="h-8 text-xs bg-background/50"
                                            />
                                        ) : field.type === 'number' ? (
                                            <Input
                                                type="number"
                                                value={item[field.name] || ''}
                                                onChange={(e) => handleChange(index, field.name, Number(e.target.value))}
                                                className="h-8 text-xs bg-background/50"
                                            />
                                        ) : field.type === 'boolean' ? (
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={!!item[field.name]}
                                                    onCheckedChange={(checked) => handleChange(index, field.name, checked)}
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    {item[field.name] ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>
                                        ) : field.type === 'select' ? (
                                            <select
                                                value={item[field.name] || ''}
                                                onChange={(e) => handleChange(index, field.name, e.target.value)}
                                                className="w-full h-8 px-3 rounded-md border border-input bg-background/50 text-xs focus:ring-1 focus:ring-ring"
                                            >
                                                <option value="" disabled>Select option...</option>
                                                {(Array.isArray(field.options) ? field.options : []).map((opt: any) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="p-2 text-xs text-destructive bg-destructive/10 rounded">
                                                Unsupported field type: {field.type}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <Button
                variant="outline"
                onClick={handleAdd}
                disabled={disabled}
                className="w-full h-9 border-dashed text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all gap-2"
            >
                <Plus className="h-3.5 w-3.5" />
                Add {schema.displayName || 'Item'}
            </Button>
        </div>
    )
}
