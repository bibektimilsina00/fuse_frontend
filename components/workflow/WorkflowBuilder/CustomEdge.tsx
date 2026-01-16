import React from 'react';
import {
    EdgeProps,
    getBezierPath,
    EdgeLabelRenderer,
    useReactFlow,
} from 'reactflow';
import { Plus, Trash2 } from 'lucide-react';

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const { setEdges, setNodes, getEdge } = useReactFlow();
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    const onAddNodeBetween = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        // This will be handled by the parent or a custom event/hook
        // For now, let's trigger a custom event that WorkflowBuilder can listen to
        const event = new CustomEvent('addNodeBetween', {
            detail: { edgeId: id, x: labelX, y: labelY }
        });
        window.dispatchEvent(event);
    };

    return (
        <>
            <path
                id={id}
                style={{
                    ...style,
                    strokeWidth: 3,
                    stroke: '#9ca3af',
                }}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <div className="flex items-center gap-1.5 p-1 bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-sm opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <button
                            className="w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:scale-110 transition-transform"
                            onClick={onAddNodeBetween}
                            title="Add node between"
                        >
                            <Plus size={12} strokeWidth={3} />
                        </button>
                        <button
                            className="w-5 h-5 flex items-center justify-center bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform"
                            onClick={onEdgeClick}
                            title="Delete connection"
                        >
                            <Trash2 size={12} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
