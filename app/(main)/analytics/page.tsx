'use client'

import { motion } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Clock,
    Zap,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

function StatCard({
    label,
    value,
    change,
    trend,
    icon: Icon
}: {
    label: string
    value: string
    change: string
    trend: 'up' | 'down'
    icon: React.ComponentType<{ className?: string }>
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                    trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                )}>
                    {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {change}
                </span>
            </div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
        </motion.div>
    )
}

function ChartPlaceholder({ title, height = 300 }: { title: string; height?: number }) {
    return (
        <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">{title}</h3>
            <div
                className="bg-muted/50 rounded-lg flex items-center justify-center"
                style={{ height }}
            >
                <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Chart visualization</p>
                    <p className="text-xs text-muted-foreground/60">Integrate with chart library</p>
                </div>
            </div>
        </div>
    )
}

export default function AnalyticsPage() {
    const stats = [
        { label: 'Total Executions', value: '12,458', change: '+12.5%', trend: 'up' as const, icon: Zap },
        { label: 'Success Rate', value: '98.7%', change: '+2.1%', trend: 'up' as const, icon: CheckCircle2 },
        { label: 'Avg. Duration', value: '1.8s', change: '-15%', trend: 'up' as const, icon: Clock },
        { label: 'Failed Runs', value: '162', change: '-8.3%', trend: 'up' as const, icon: XCircle },
    ]

    const timeRanges = ['24h', '7d', '30d', '90d', '1y']

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Monitor workflow performance and usage metrics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {timeRanges.map(range => (
                        <Button
                            key={range}
                            variant={range === '7d' ? 'default' : 'outline'}
                            size="sm"
                        >
                            {range}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder title="Executions Over Time" height={300} />
                <ChartPlaceholder title="Success vs Failed" height={300} />
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartPlaceholder title="Top Workflows by Usage" height={250} />
                <ChartPlaceholder title="Execution Duration Distribution" height={250} />
                <ChartPlaceholder title="Hourly Activity" height={250} />
            </div>

            {/* Table Section */}
            <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Top Performing Workflows</h3>
                    <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Workflow</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Executions</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Success Rate</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avg Duration</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Email to CRM Pipeline', executions: 3420, success: 99.2, duration: '1.2s', trend: 'up' },
                                { name: 'Slack Notifications', executions: 2890, success: 98.5, duration: '0.8s', trend: 'up' },
                                { name: 'Daily Report Generator', executions: 1250, success: 97.8, duration: '3.5s', trend: 'down' },
                                { name: 'Webhook Handler', executions: 980, success: 96.4, duration: '0.5s', trend: 'up' },
                            ].map((row, i) => (
                                <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                    <td className="py-3 px-4 font-medium">{row.name}</td>
                                    <td className="py-3 px-4 text-muted-foreground">{row.executions.toLocaleString()}</td>
                                    <td className="py-3 px-4">
                                        <span className="text-emerald-500">{row.success}%</span>
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground font-mono">{row.duration}</td>
                                    <td className="py-3 px-4">
                                        {row.trend === 'up' ? (
                                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
