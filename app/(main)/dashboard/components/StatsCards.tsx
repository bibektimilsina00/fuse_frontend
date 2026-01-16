import { motion } from 'framer-motion'
import { Workflow as WorkflowIcon, Zap, Clock } from 'lucide-react'

interface StatsCardsProps {
    activeWorkflows: number
    totalExecutions: number
    avgExecutionTime: string
}

export function StatsCards({ activeWorkflows, totalExecutions, avgExecutionTime }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <WorkflowIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        +12%
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeWorkflows}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Workflows</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        +24%
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {(totalExecutions / 1000).toFixed(1)}k
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Executions</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                        Avg
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{avgExecutionTime}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Execution Time</p>
            </motion.div>
        </div>
    )
}
