import * as React from 'react'
import { motion } from 'framer-motion'
import {
    MessageCircle,
    Mail,
    ShoppingCart,
    Users,
    FileText,
    Zap,
    TrendingUp,
    Calendar,
    DollarSign
} from 'lucide-react'
import { WorkflowTemplate } from '@/types/workflow'
import { Button } from '@/components/ui/Button'

const templateIcons: Record<string, any> = {
    whatsapp: MessageCircle,
    email: Mail,
    ecommerce: ShoppingCart,
    leads: Users,
    documents: FileText,
    automation: Zap,
    analytics: TrendingUp,
    scheduling: Calendar,
    payments: DollarSign
}

interface TemplateLibraryProps {
    onUseTemplate: (template: WorkflowTemplate) => void
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onUseTemplate }) => {
    const templates: WorkflowTemplate[] = [
        {
            id: '1',
            name: 'WhatsApp Auto-Reply',
            description: 'Automatically respond to WhatsApp messages based on keywords and intent',
            category: 'whatsapp',
            nodes: [],
            edges: []
        },
        {
            id: '2',
            name: 'Lead Collection Bot',
            description: 'Capture leads from WhatsApp, extract details, and save to Google Sheets',
            category: 'leads',
            nodes: [],
            edges: []
        },
        {
            id: '3',
            name: 'Email Auto-Responder',
            description: 'Send personalized email replies using AI when new emails arrive',
            category: 'email',
            nodes: [],
            edges: []
        },
        {
            id: '4',
            name: 'Order Intake System',
            description: 'Process orders from WhatsApp and log them to Google Sheets',
            category: 'ecommerce',
            nodes: [],
            edges: []
        },
        {
            id: '5',
            name: 'FAQ Bot',
            description: 'Answer common questions automatically using AI',
            category: 'automation',
            nodes: [],
            edges: []
        },
        {
            id: '6',
            name: 'Payment Link Generator',
            description: 'Create and send Stripe payment links when requested',
            category: 'payments',
            nodes: [],
            edges: []
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Template Library
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Start with a ready-made workflow and customize it
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template, index) => (
                    <TemplateCard
                        key={template.id}
                        template={template}
                        index={index}
                        onUse={() => onUseTemplate(template)}
                    />
                ))}
            </div>
        </div>
    )
}

const TemplateCard = ({
    template,
    index,
    onUse
}: {
    template: WorkflowTemplate
    index: number
    onUse: () => void
}) => {
    const Icon = templateIcons[template.category] || Zap

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-slate-900/50 transition-all overflow-hidden"
        >
            {/* Gradient Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                        <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {template.name}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
                    {template.description}
                </p>

                <Button
                    onClick={onUse}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20"
                >
                    Use Template
                </Button>
            </div>
        </motion.div>
    )
}
