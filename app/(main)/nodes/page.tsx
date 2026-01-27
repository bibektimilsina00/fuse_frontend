'use client'

import React, { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nodesApi } from '@/services/api/nodes';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Search, Plus, Package, Code, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NodesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: nodes, isLoading } = useQuery({
        queryKey: ['nodes'],
        queryFn: nodesApi.list
    });

    const filteredNodes = useMemo(() => {
        if (!nodes) return [];
        return nodes.filter(node =>
            node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [nodes, searchQuery]);

    const handleCreateNode = () => {
        router.push('/nodes/new');
    };

    return (
        <div className="h-full flex flex-col space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nodes</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage built-in and custom workflow nodes.
                    </p>
                </div>
                <Button onClick={handleCreateNode}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Custom Node
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search nodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNodes.map((node) => (
                        <div
                            key={node.id}
                            className="group relative flex flex-col justify-between rounded-lg border p-6 hover:shadow-md transition-shadow bg-card text-card-foreground cursor-pointer"
                            onClick={() => node.is_custom && router.push(`/nodes/${node.id}`)}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 rounded-md bg-muted/50">
                                        {node.is_custom ? <Code className="w-5 h-5 text-primary" /> : <Package className="w-5 h-5 text-muted-foreground" />}
                                    </div>
                                    <div className="flex gap-2">
                                        {node.is_custom && (
                                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">Custom</Badge>
                                        )}
                                        <Badge variant="outline">{node.version}</Badge>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-lg mb-1">{node.name}</h3>
                                <div className="text-xs font-mono text-muted-foreground mb-3">{node.id}</div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{node.description}</p>
                            </div>

                            {node.is_custom && (
                                <div className="mt-4 pt-4 border-t flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-medium text-primary flex items-center">
                                        Edit Node <ArrowRight className="w-3 h-3 ml-1" />
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredNodes.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
                            <div className="p-3 bg-muted rounded-full mb-4">
                                <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No nodes found</h3>
                            <p className="text-muted-foreground mb-4">
                                No nodes match your search query.
                            </p>
                            <Button variant="outline" onClick={() => setSearchQuery('')}>
                                Clear Search
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
