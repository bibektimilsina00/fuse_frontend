'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { nodesApi } from '@/services/api/nodes';
import { Loader2 } from 'lucide-react';
import NodeEditor from '../components/NodeEditor';

export default function EditNodeClient({ nodeId }: { nodeId: string }) {
    const { data: node, isLoading, error } = useQuery({
        queryKey: ['node', nodeId],
        queryFn: () => nodesApi.get(nodeId),
        enabled: nodeId !== 'new'
    });

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !node) {
        return (
            <div className="h-full flex items-center justify-center text-destructive">
                Failed to load node.
            </div>
        );
    }

    // Only allow editing custom nodes
    if (!node.is_custom) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="text-xl font-medium">Read Only</div>
                <div className="text-muted-foreground">Built-in nodes cannot be edited here.</div>
            </div>
        )
    }

    return <NodeEditor mode="edit" nodeId={nodeId} initialData={node} />;
}
