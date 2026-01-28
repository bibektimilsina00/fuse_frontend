'use client'

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nodesApi } from '@/services/api/nodes';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    Search,
    Plus,
    Zap,
    Play,
    GitBranch,
    Settings2,
    Sparkles,
    Boxes,
    Layers,
    Activity,
    ArrowRight,
    FileCode,
    Database,
    Globe,
    MessageSquare,
    Box
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { NodeManifestV2 } from '@/types/workflow';

const CATEGORIES = [
    { id: 'all', name: 'All Nodes', icon: Boxes },
    { id: 'TRIGGER', name: 'Triggers', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'ACTION', name: 'Actions', icon: Play, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'LOGIC', name: 'Logic', icon: GitBranch, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'UTILITY', name: 'Utilities', icon: Settings2, color: 'text-slate-500', bg: 'bg-slate-500/10' },
    { id: 'AI', name: 'AI & Agents', icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-500/10' },
];

function NodeCard({ node, onClick }: { node: any; onClick: () => void }) {
    const manifest = node.manifest as unknown as NodeManifestV2 | undefined;
    const isCustom = node.is_custom;
    const category = (manifest?.category || node.category || '').toUpperCase();
    const service = manifest?.service;

    // Determine icon based on manifest svg, category or custom status
    const { Icon, isSvg } = useMemo(() => {
        if (manifest?.icon_svg) {
            return { Icon: manifest.icon_svg, isSvg: true };
        }

        if (isCustom) return { Icon: FileCode, isSvg: false };
        if (category === 'TRIGGER') return { Icon: Zap, isSvg: false };
        if (category === 'LOGIC') return { Icon: GitBranch, isSvg: false };
        if (category === 'AI') return { Icon: Sparkles, isSvg: false };
        if (node.name.includes('data') || node.name.includes('sheet')) return { Icon: Database, isSvg: false };
        if (node.name.includes('http') || node.name.includes('webhook')) return { Icon: Globe, isSvg: false };
        if (node.name.includes('slack') || node.name.includes('discord') || node.name.includes('email')) return { Icon: MessageSquare, isSvg: false };

        return { Icon: Play, isSvg: false };
    }, [category, node.name, isCustom, manifest]);

    const categoryStyle = useMemo(() => {
        if (isCustom) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (category === 'TRIGGER') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        if (category === 'ACTION') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        if (category === 'LOGIC') return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
        if (category === 'AI') return 'text-violet-500 bg-violet-500/10 border-violet-500/20';
        return 'text-muted-foreground bg-muted/50 border-border';
    }, [category, isCustom]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={onClick}
            className="group relative flex flex-col h-full rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.1)]"
        >
            {/* Background Ornaments */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />

            <div className="p-5 flex flex-col h-full relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-primary/20",
                        isCustom ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
                            category === 'TRIGGER' ? "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white" :
                                category === 'ACTION' ? "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white" :
                                    category === 'AI' ? "bg-violet-500/10 text-violet-500 group-hover:bg-violet-500 group-hover:text-white" :
                                        category === 'LOGIC' ? "bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white" :
                                            "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                    )}>
                        {isSvg ? (
                            <div
                                className="h-6 w-6 [&>svg]:w-full [&>svg]:h-full"
                                dangerouslySetInnerHTML={{ __html: Icon as string }}
                            />
                        ) : (
                            // @ts-ignore
                            <Icon className="h-6 w-6" />
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <div className="flex gap-1.5">
                            {service && (
                                <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-500/10 border-slate-500/20">
                                    {service}
                                </Badge>
                            )}
                            <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", categoryStyle)}>
                                {isCustom ? 'Custom' : category || 'General'}
                            </Badge>
                        </div>
                        <span className="text-[10px] font-mono font-medium text-muted-foreground/50">v{node.version}</span>
                    </div>
                </div>

                <div className="space-y-1.5 mb-4">
                    <h3 className="font-bold text-base tracking-tight group-hover:text-primary transition-colors truncate">
                        {manifest?.displayName || node.name}
                    </h3>
                    <code className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded font-mono text-muted-foreground/60 block w-fit">
                        {node.id}
                    </code>
                </div>

                <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 mb-6">
                    {manifest?.description || node.description || 'No description provided for this node.'}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/10">
                    <div className="flex -space-x-1">
                        <div className="h-5 px-1.5 rounded-full border border-border bg-muted/30 flex items-center gap-1">
                            <Layers className="h-2.5 w-2.5 text-muted-foreground/60" />
                            <span className="text-[9px] font-bold text-muted-foreground/80">{manifest?.inputs?.length || 0}</span>
                        </div>
                        <div className="h-5 px-1.5 rounded-full border border-border bg-muted/30 flex items-center gap-1">
                            <Activity className="h-2.5 w-2.5 text-muted-foreground/60" />
                            <span className="text-[9px] font-bold text-muted-foreground/80">{manifest?.outputs?.length || 0}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="text-[10px] font-bold text-primary tracking-tight">Configure</span>
                        <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function NodesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const { data: nodes = [], isLoading } = useQuery({
        queryKey: ['nodes'],
        queryFn: nodesApi.list
    });

    const filteredNodes = useMemo(() => {
        return nodes.filter(node => {
            const manifest = node.manifest as unknown as NodeManifestV2 | undefined;
            const category = (manifest?.category || node.category || '').toUpperCase();
            const service = (manifest?.service || '').toLowerCase();
            const name = (manifest?.displayName || node.name).toLowerCase();
            const id = node.id.toLowerCase();
            const desc = (manifest?.description || node.description || '').toLowerCase();

            const query = searchQuery.toLowerCase();
            const matchesSearch =
                name.includes(query) ||
                desc.includes(query) ||
                id.includes(query) ||
                service.includes(query);

            if (!matchesSearch) return false;

            if (activeCategory === 'all') return true;
            if (activeCategory === 'custom') return node.is_custom;

            return category === activeCategory;
        });
    }, [nodes, searchQuery, activeCategory]);

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Boxes className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Node Explorer</h1>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="relative w-full max-w-md hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-muted/10 border-border/20 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none text-sm font-semibold placeholder:text-muted-foreground/30"
                        />
                    </div>
                    <Button
                        onClick={() => router.push('/nodes/new')}
                        className="rounded-xl px-5 h-11 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        Create Custom Node
                    </Button>
                </div>
            </div>

            {/* Mobile Search - Visible only on small screens */}
            <div className="relative w-full md:hidden">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-muted/10 border-border/20 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none text-sm font-semibold placeholder:text-muted-foreground/30"
                />
            </div>

            {/* Category Toolbar */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border shrink-0",
                                isActive
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                    : "bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/50 hover:border-border"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", !isActive && (cat.color || "text-muted-foreground"))} />
                            {cat.name}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {filteredNodes.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-6 bg-muted/5 rounded-[3rem] border border-dashed border-border/50"
                        >
                            <div className="h-20 w-20 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto ring-1 ring-primary/10">
                                <Box className="h-10 w-10 text-primary/20" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">No nodes found</h2>
                                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                                    {searchQuery || activeCategory !== 'all'
                                        ? "Try adjusting your filters or search terms to find what you're looking for."
                                        : "It looks like you don't have any nodes yet. Start by creating a custom node!"}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                {(searchQuery || activeCategory !== 'all') && (
                                    <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="rounded-xl h-11 px-8 font-bold">
                                        Reset Filters
                                    </Button>
                                )}
                                <Button onClick={() => router.push('/nodes/new')} className="gap-2 px-8 rounded-xl h-11 font-bold">
                                    <Plus className="h-4 w-4" />
                                    Build Custom Node
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {filteredNodes.map((node) => (
                                <NodeCard
                                    key={node.id}
                                    node={node}
                                    onClick={() => {
                                        if (node.is_custom) {
                                            router.push(`/nodes/${node.id}`);
                                        }
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
