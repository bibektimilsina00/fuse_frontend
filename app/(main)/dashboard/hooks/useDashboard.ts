import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkflows, useGenerateWorkflowWithAI, useCreateWorkflow, useSaveWorkflow } from '@/services/queries/workflows'
import type { Workflow } from '@/services/api/workflows'
import { logger } from '@/lib/logger'

export function useDashboard() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [activeTab, setActiveTab] = useState('workflows')

    const { data, isLoading, error } = useWorkflows()
    const generateWithAI = useGenerateWorkflowWithAI()
    const createWorkflow = useCreateWorkflow()
    const saveWorkflow = useSaveWorkflow()

    const workflows = Array.isArray(data) ? data : []

    const filteredWorkflows = useMemo(() => {
        return workflows.filter((w) =>
            w.meta.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.meta.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [workflows, searchQuery])

    const stats = useMemo(() => {
        const activeCount = workflows.filter(w => w.meta.status === 'active').length
        const totalExecutions = workflows.length * 1000 // Mock data
        const avgExecutionTime = '1.2s' // Mock data

        return {
            activeWorkflows: activeCount,
            totalExecutions,
            avgExecutionTime,
        }
    }, [workflows])

    const handleAICreate = async (prompt: string, model?: string, credentialId?: string) => {
        try {
            // 1. Generate the workflow nodes/edges from AI
            const aiResult = await generateWithAI.mutateAsync({ prompt, model, credentialId })
            logger.info('AI Generation Result:', aiResult)

            // 2. Create a new empty workflow
            const newWorkflow = await createWorkflow.mutateAsync({
                name: 'AI Generated Workflow',
                description: prompt,
            })

            if (newWorkflow && newWorkflow.id) {
                // 3. Save the generated workflow structure to the new workflow
                if (aiResult.nodes && aiResult.edges) {
                    await saveWorkflow.mutateAsync({
                        workflow_id: newWorkflow.id,
                        meta: {
                            id: newWorkflow.id,
                            name: newWorkflow.meta.name,
                            description: newWorkflow.meta.description,
                            version: newWorkflow.meta.version || '1.0.0',
                            status: 'draft',
                            tags: [],
                            created_at: newWorkflow.meta.created_at,
                            updated_at: new Date().toISOString()
                        },
                        graph: {
                            nodes: aiResult.nodes,
                            edges: aiResult.edges
                        },
                        execution: {
                            mode: 'sequential',
                            timeout_seconds: 300
                        },
                        observability: { logging: true, metrics: false },
                        ai: { model: 'default' }
                    })
                }

                // 4. Redirect to the editor
                router.push(`/workflows/${newWorkflow.id}`)
            }
        } catch (error) {
            logger.error('Failed to generate workflow:', error)
            throw error
        }
    }

    return {
        workflows: filteredWorkflows,
        isLoading,
        error,
        stats,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        handleAICreate,
        isGeneratingAI: generateWithAI.isPending
    }
}
