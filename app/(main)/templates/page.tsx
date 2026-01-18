'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Search,
    ChevronRight,
    Star,
    Clock,
    Users,
    Zap,
    Mail,
    Database,
    Globe,
    MessageSquare,
    Bot,
    FileText,
    Calendar,
    ShoppingCart
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Template {
    id: string
    name: string
    description: string
    category: string
    icon: React.ReactNode
    gradient: string
    usageCount: number
    isFeatured: boolean
}

const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'sales', label: 'Sales' },
    { id: 'support', label: 'Support' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'ai', label: 'AI & ML' },
]

const templates: Template[] = [
    {
        id: '1',
        name: 'Slack Notification on Form Submit',
        description: 'Send a Slack message when someone submits a form',
        category: 'marketing',
        icon: <MessageSquare className="h-6 w-6" />,
        gradient: 'from-purple-500/20 to-indigo-500/20',
        usageCount: 15420,
        isFeatured: true
    },
    {
        id: '2',
        name: 'Email to CRM Lead',
        description: 'Automatically create CRM leads from incoming emails',
        category: 'sales',
        icon: <Mail className="h-6 w-6" />,
        gradient: 'from-blue-500/20 to-cyan-500/20',
        usageCount: 8930,
        isFeatured: true
    },
    {
        id: '3',
        name: 'AI Content Generator',
        description: 'Generate blog posts and social content with AI',
        category: 'ai',
        icon: <Bot className="h-6 w-6" />,
        gradient: 'from-green-500/20 to-emerald-500/20',
        usageCount: 12500,
        isFeatured: true
    },
    {
        id: '4',
        name: 'Database Backup to Cloud',
        description: 'Schedule automatic database backups to cloud storage',
        category: 'engineering',
        icon: <Database className="h-6 w-6" />,
        gradient: 'from-amber-500/20 to-orange-500/20',
        usageCount: 5670,
        isFeatured: false
    },
    {
        id: '5',
        name: 'Support Ticket Triage',
        description: 'Auto-categorize and assign support tickets with AI',
        category: 'support',
        icon: <FileText className="h-6 w-6" />,
        gradient: 'from-red-500/20 to-pink-500/20',
        usageCount: 7890,
        isFeatured: false
    },
    {
        id: '6',
        name: 'Calendar Event Sync',
        description: 'Sync events between multiple calendar providers',
        category: 'engineering',
        icon: <Calendar className="h-6 w-6" />,
        gradient: 'from-sky-500/20 to-blue-500/20',
        usageCount: 4320,
        isFeatured: false
    },
    {
        id: '7',
        name: 'E-commerce Order Processing',
        description: 'Automate order confirmation and inventory updates',
        category: 'sales',
        icon: <ShoppingCart className="h-6 w-6" />,
        gradient: 'from-violet-500/20 to-purple-500/20',
        usageCount: 6780,
        isFeatured: false
    },
    {
        id: '8',
        name: 'Website Uptime Monitor',
        description: 'Monitor website availability and send alerts',
        category: 'engineering',
        icon: <Globe className="h-6 w-6" />,
        gradient: 'from-teal-500/20 to-cyan-500/20',
        usageCount: 9210,
        isFeatured: true
    }
]

function TemplateCard({ template }: { template: Template }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br", template.gradient)}>
                    {template.icon}
                </div>
                {template.isFeatured && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 fill-amber-500" />
                        Featured
                    </span>
                )}
            </div>
            <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                {template.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
            </p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {template.usageCount.toLocaleString()} uses
                </div>
                <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                    Use Template
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </motion.div>
    )
}

export default function TemplatesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = activeCategory === 'all' || t.category === activeCategory
        return matchesSearch && matchesCategory
    })

    const featuredTemplates = templates.filter(t => t.isFeatured)

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Start quickly with pre-built workflow templates
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all",
                            activeCategory === cat.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Featured Section */}
            {activeCategory === 'all' && !searchQuery && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                        <h2 className="text-lg font-semibold">Featured Templates</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {featuredTemplates.map(template => (
                            <TemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                </div>
            )}

            {/* All Templates */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                    {activeCategory === 'all' ? 'All Templates' : categories.find(c => c.id === activeCategory)?.label}
                </h2>
                {filteredTemplates.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No templates found</h3>
                        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredTemplates.map(template => (
                            <TemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
