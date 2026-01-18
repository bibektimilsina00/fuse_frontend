import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    useWorkflows,
    useDeleteWorkflow,
    useUpdateWorkflow,
    useCreateWorkflow,
    useGenerateWorkflowWithAI,
    useSaveWorkflow,
} from '@/services/queries/workflows'
import type { Workflow } from '@/services/api/workflows'
import { logger } from '@/lib/logger'

export function useWorkflowsPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [activeTab, setActiveTab] = useState('workflows')

    const { data, isLoading, error } = useWorkflows()
    const workflows = Array.isArray(data) ? data : []
    const deleteWorkflow = useDeleteWorkflow()
    const updateWorkflow = useUpdateWorkflow()
    const createWorkflow = useCreateWorkflow()

    const filteredWorkflows = workflows.filter(
        (w) =>
            w.meta.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.meta.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null)

    const handleDelete = (id: string) => {
        setWorkflowToDelete(id)
        setDeleteConfirmOpen(true)
    }

    const confirmDelete = async () => {
        if (workflowToDelete) {
            await deleteWorkflow.mutateAsync(workflowToDelete)
            setWorkflowToDelete(null)
        }
    }

    const handleEdit = (id: string) => {
        router.push(`/workflows/${id}`)
    }

    const handleToggle = async (id: string) => {
        const workflow = workflows.find((w) => w.id === id)
        if (workflow) {
            await updateWorkflow.mutateAsync({
                id,
                data: {
                    status: workflow.meta.status === 'active' ? 'inactive' : 'active',
                },
            })
        }
    }

    const handleDuplicate = async (id: string) => {
        const workflow = workflows.find((w) => w.id === id)
        if (workflow) {
            await createWorkflow.mutateAsync({
                name: `${workflow.meta.name} (Copy)`,
                description: workflow.meta.description,
            })
        }
    }

    const handleCreateNew = async () => {
        const newWorkflow = await createWorkflow.mutateAsync({
            name: 'New Workflow',
            description: '',
        })
        router.push(`/workflows/${newWorkflow.id}`)
    }

    const [showAIDialog, setShowAIDialog] = useState(false)

    const handleOpenAIDialog = () => {
        setShowAIDialog(true)
    }

    const handleCloseAIDialog = () => {
        setShowAIDialog(false)
    }

    const saveWorkflow = useSaveWorkflow()
    const generateWithAI = useGenerateWorkflowWithAI()

    const handleGenerateWithAI = async (prompt: string, model?: string, credentialId?: string) => {
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
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        handleEdit,
        handleDelete,
        handleToggle,
        handleDuplicate,
        handleCreateNew,
        showAIDialog,
        handleOpenAIDialog,
        handleCloseAIDialog,
        handleGenerateWithAI,
        // Delete confirmation
        deleteConfirmOpen,
        setDeleteConfirmOpen,
        workflowToDelete,
        confirmDelete,
    }
}
