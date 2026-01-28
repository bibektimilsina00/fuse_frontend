import React from 'react';
import {
    EdgeProps,
    getBezierPath,
    EdgeLabelRenderer,
    useReactFlow,
} from 'reactflow';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    targetHandleId,
    sourceHandleId,
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

    const [isHovered, setIsHovered] = React.useState(false);

    const onAddNodeBetween = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        // This will be handled by the parent or a custom event/hook
        // For now, let's trigger a custom event that WorkflowBuilder can listen to
        const event = new CustomEvent('addNodeBetween', {
            detail: { edgeId: id, x: labelX, y: labelY }
        });
        window.dispatchEvent(event);
    };

    const targetHandle = targetHandleId;
    const isAuxiliary = targetHandle && ['chat_model', 'memory', 'tools'].includes(targetHandle.toString().toLowerCase());

    return (
        <g
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Invisible interaction path (wider for easier hovering) */}
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                className="react-flow__edge-interaction"
                style={{ cursor: 'pointer' }}
            />
            <path
                id={id}
                style={{
                    ...style,
                    strokeWidth: isHovered ? 4 : 3,
                    stroke: isHovered ? '#3b82f6' : '#9ca3af',
                    strokeDasharray: isAuxiliary ? '6, 4' : undefined,
                    transition: 'stroke 0.2s, stroke-width 0.2s',
                }}
                className={`react-flow__edge-path ${isAuxiliary ? 'opacity-60' : ''}`}
                d={edgePath}
                markerEnd={markerEnd}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: isHovered ? 'all' : 'none',
                    }}
                    className="nodrag nopan"
                >
                    <div className={cn(
                        "flex items-center gap-1.5 p-1 bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-sm transition-opacity duration-200",
                        isHovered ? "opacity-100" : "opacity-0"
                    )}>
                        {!isAuxiliary && (
                            <button
                                className="w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:scale-110 transition-transform"
                                onClick={onAddNodeBetween}
                                title="Add node between"
                            >
                                <Plus size={12} strokeWidth={3} />
                            </button>
                        )}
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
        </g>
    );
}
