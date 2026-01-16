'use client'

import { motion } from 'framer-motion'
import {
    Activity,
    Zap,
    CheckCircle2,
    Plus,
    ArrowRight,
    Clock,
    MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AICreateDialog } from '@/components/ai/AICreateDialog'
import Link from 'next/link'
import { useDashboard } from './hooks/useDashboard'

export default function DashboardPage() {
    const {
        stats: dataStats,
        workflows: recentWorkflows,
        handleAICreate
    } = useDashboard()

    const stats = [
        {
            label: 'Total Executions',
            value: dataStats.totalExecutions.toLocaleString(),
            change: '+12%',
            trend: 'up',
            icon: Zap,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'Success Rate',
            value: '98.5%',
            change: '+0.5%',
            trend: 'up',
            icon: CheckCircle2,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            label: 'Active Workflows',
            value: dataStats.activeWorkflows.toString(),
            change: '+2',
            trend: 'up',
            icon: Activity,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            label: 'Avg. Duration',
            value: dataStats.avgExecutionTime,
            change: '-10%',
            trend: 'down',
            icon: Clock,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
        }
    ]

    const recentRuns = recentWorkflows.slice(0, 4).map(w => ({
        id: w.id,
        workflow: w.meta.name,
        status: w.meta.status === 'active' ? 'success' : 'failed',
        time: new Date(w.meta.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: '1.2s'
    }))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of your automation performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline">View Reports</Button>
                    <AICreateDialog onSubmit={handleAICreate} />
                    <Link href="/workflows">
                        <Button variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            New Workflow
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={cn("p-2 rounded-lg", stat.bg)}>
                                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                                </div>
                                <span className={cn(
                                    "text-xs font-medium px-2 py-1 rounded-full",
                                    stat.trend === 'up'
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                )}>
                                    {stat.change}
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold">{stat.value}</h3>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Recent Activity */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Recent Activity</h2>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                            View All <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {recentRuns.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No recent activity
                            </div>
                        ) : (
                            recentRuns.map((run) => (
                                <div key={run.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            run.status === 'success' ? "bg-green-500" : "bg-red-500"
                                        )} />
                                        <div>
                                            <p className="font-medium text-sm">{run.workflow}</p>
                                            <p className="text-xs text-muted-foreground">{run.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-mono text-muted-foreground">{run.duration}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Quick Actions / Templates */}
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Quick Start</h2>
                    </div>
                    <div className="space-y-3">
                        {['Webhook to Slack', 'Form to Email', 'Weekly Digest'].map((template) => (
                            <button
                                key={template}
                                className="w-full flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-all group text-left"
                            >
                                <span className="font-medium">{template}</span>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Plus className="h-4 w-4" />
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}
