import { Search, Grid3x3, List } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface WorkflowsToolbarProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    viewMode: 'grid' | 'list'
    onViewModeChange: (mode: 'grid' | 'list') => void
}

export function WorkflowsToolbar({
    searchQuery,
    onSearchChange,
    viewMode,
    onViewModeChange,
}: WorkflowsToolbarProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 w-full"
                />
            </div>

            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewModeChange('grid')}
                    className={cn(
                        "h-8 w-8",
                        viewMode === 'grid' ? "bg-background shadow-sm" : "hover:bg-transparent"
                    )}
                >
                    <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewModeChange('list')}
                    className={cn(
                        "h-8 w-8",
                        viewMode === 'list' ? "bg-background shadow-sm" : "hover:bg-transparent"
                    )}
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
