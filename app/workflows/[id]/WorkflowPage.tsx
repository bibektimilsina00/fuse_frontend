'use client'

import { useParams } from 'next/navigation'
import { ReactFlowProvider } from 'reactflow'
import { WorkflowBuilder } from '@/components/workflow'
import { useToast } from '@/components/ui/use-toast'
import { useWorkflow } from '@/services/queries/workflows'
import { useSaveState } from '@/components/workflow/WorkflowBuilder/hooks/useSaveState'
import { useState, useEffect } from 'react'

export default function WorkflowBuilderPage() {
    const params = useParams()
    const workflowId = params.id as string
    const { toast } = useToast()

    // Fetch workflow data to get the name (everything else is handled in the builder hook)
    const { data: workflowData } = useWorkflow(workflowId)

    return (
        <ReactFlowProvider>
            <div className="h-screen">
                <WorkflowBuilder
                    workflowId={workflowId}
                    workflowName={workflowData?.meta?.name}
                    onBack={() => { window.history.back() }}
                />
            </div>
        </ReactFlowProvider>
    )
}
