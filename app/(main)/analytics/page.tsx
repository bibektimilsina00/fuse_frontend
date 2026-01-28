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
    ArrowDownRight,
    Puzzle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useAnalytics } from './hooks/useAnalytics'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts'

const ICON_MAP: Record<string, any> = {
    Zap,
    CheckCircle2,
    Clock,
    XCircle,
    Activity,
    Puzzle
}

function StatCard({
    label,
    value,
    change,
    trend,
    iconName
}: {
    label: string
    value: string
    change: string
    trend: 'up' | 'down'
    iconName: string
}) {
    const Icon = ICON_MAP[iconName] || BarChart3
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-200"
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

export default function AnalyticsPage() {
    const { stats, chartData, topWorkflows, isLoading } = useAnalytics()
    const timeRanges = ['24h', '7d', '30d', '90d', '1y']

    if (isLoading) {
        return (
            <div className="space-y-8 max-w-[1600px] mx-auto animate-pulse">
                <div className="h-20 bg-muted rounded-xl w-1/3" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="h-[300px] bg-muted rounded-xl" />
                    <div className="h-[300px] bg-muted rounded-xl" />
                </div>
            </div>
        )
    }

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
                <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border">
                    {timeRanges.map(range => (
                        <Button
                            key={range}
                            variant={range === '7d' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8"
                        >
                            {range}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} iconName={stat.icon} />
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Area Chart: Executions over time */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg">Executions Over Time</h3>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-primary" />
                                <span className="text-muted-foreground">Executions</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="executions"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorExec)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart: Success vs Failed */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg">Success vs Failed</h3>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-muted-foreground">Success</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                <span className="text-muted-foreground">Failed</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="success" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="failed" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Additional Charts */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartPlaceholder title="Top Workflows by Usage" height={250} />
                <ChartPlaceholder title="Execution Duration Distribution" height={250} />
                <ChartPlaceholder title="Hourly Activity" height={250} />
            </div> */}

            {/* Table Section */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-lg">Top Performing Workflows</h3>
                        <p className="text-sm text-muted-foreground">Most active workflows in the selected period</p>
                    </div>
                    <Button variant="outline" size="sm">Download PDF</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Workflow</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Executions</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Success Rate</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Duration</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {topWorkflows.map((row, i) => (
                                <tr key={i} className="group hover:bg-muted/30 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {row.name.charAt(0)}
                                            </div>
                                            <span className="font-medium group-hover:text-primary transition-colors">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-muted-foreground">{row.executions.toLocaleString()}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[100px]">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${row.success}%` }}
                                                />
                                            </div>
                                            <span className="text-emerald-500 font-medium">{row.success}%</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-muted-foreground font-mono text-xs">{row.duration}</td>
                                    <td className="py-4 px-4">
                                        {row.trend === 'up' ? (
                                            <div className="flex items-center gap-1 text-emerald-500">
                                                <TrendingUp className="h-4 w-4" />
                                                <span className="text-xs font-medium">Increasing</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-red-500">
                                                <TrendingDown className="h-4 w-4" />
                                                <span className="text-xs font-medium">Decreasing</span>
                                            </div>
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
