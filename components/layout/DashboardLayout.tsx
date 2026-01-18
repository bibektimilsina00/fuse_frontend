'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { FloatingAIButton } from '@/components/ai/FloatingAIButton'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { AIAssistantProvider, useAIAssistant } from '@/components/providers'
import { useCreateWorkflow, useSaveWorkflow, useGenerateWorkflowWithAI } from '@/services/queries/workflows'
import { logger } from '@/lib/logger'

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isOpen, mode, closeAssistant } = useAIAssistant()
    const generateWithAI = useGenerateWorkflowWithAI()
    const createWorkflow = useCreateWorkflow()
    const saveWorkflow = useSaveWorkflow()

    const handleAICreateWorkflow = async (prompt: string, model: string, credentialId?: string) => {
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
                        ai: { model: model || 'default' }
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

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNav />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>

            <FloatingAIButton onCreateWorkflow={handleAICreateWorkflow} />
            
            <AIAssistant
                isOpen={isOpen}
                onClose={closeAssistant}
                onCreateWorkflow={handleAICreateWorkflow}
                defaultMode={mode}
            />
        </div>
    )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AIAssistantProvider>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </AIAssistantProvider>
    )
}
