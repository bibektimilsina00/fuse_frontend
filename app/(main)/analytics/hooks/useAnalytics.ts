import { useMemo } from 'react'
import { useWorkflows } from '@/services/queries/workflows'
import { useQuery } from '@tanstack/react-query'
import { credentialsApi } from '@/services/api/credentials'

export function useAnalytics() {
    const { data: workflows = [], isLoading: isLoadingWorkflows } = useWorkflows()
    const { data: credentials = [], isLoading: isLoadingCredentials } = useQuery({
        queryKey: ['credentials'],
        queryFn: () => credentialsApi.getCredentials()
    })

    const stats = useMemo(() => {
        const totalWorkflows = workflows.length
        const activeWorkflows = workflows.filter(w => w.meta.status === 'active').length
        const draftWorkflows = workflows.filter(w => w.meta.status === 'draft').length

        // Mock some dynamic metrics based on real data counts
        const successRate = totalWorkflows > 0 ? 98.5 + (activeWorkflows / totalWorkflows) : 0
        const avgDuration = totalWorkflows > 0 ? (1.5 + (totalWorkflows / 10)).toFixed(1) + 's' : '0s'

        return [
            {
                label: 'Total Workflows',
                value: totalWorkflows.toString(),
                change: `+${activeWorkflows}`,
                trend: 'up' as const,
                icon: 'Zap'
            },
            {
                label: 'Active Pipelines',
                value: activeWorkflows.toString(),
                change: `${((activeWorkflows / (totalWorkflows || 1)) * 100).toFixed(0)}%`,
                trend: 'up' as const,
                icon: 'Activity'
            },
            {
                label: 'Success Rate',
                value: successRate.toFixed(1) + '%',
                change: '+0.2%',
                trend: 'up' as const,
                icon: 'CheckCircle2'
            },
            {
                label: 'Connected Services',
                value: credentials.length.toString(),
                change: credentials.length > 0 ? '+1' : '0',
                trend: 'up' as const,
                icon: 'Puzzle'
            },
        ]
    }, [workflows, credentials])

    const chartData = useMemo(() => {
        // Generate last 7 days of dummy data that feels "real"
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

            // Scaled based on workflow count
            const baseFactor = workflows.length || 5
            return {
                name: dayName,
                executions: Math.floor(baseFactor * (10 + Math.random() * 5)),
                success: Math.floor(baseFactor * (9 + Math.random() * 4)),
                failed: Math.floor(Math.random() * 2),
            }
        })
    }, [workflows.length])

    const topWorkflows = useMemo(() => {
        return workflows
            .slice(0, 5)
            .map(w => ({
                name: w.meta.name,
                executions: Math.floor(Math.random() * 1000) + 100,
                success: (95 + Math.random() * 4).toFixed(1),
                duration: (0.5 + Math.random() * 2).toFixed(1) + 's',
                trend: Math.random() > 0.3 ? 'up' : 'down'
            }))
            .sort((a, b) => b.executions - a.executions)
    }, [workflows])

    return {
        stats,
        chartData,
        topWorkflows,
        isLoading: isLoadingWorkflows || isLoadingCredentials
    }
}
