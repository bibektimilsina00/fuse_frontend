import * as React from 'react'
import { Button } from '@/components/ui/Button'

export const Hero: React.FC = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="text-center max-w-2xl px-6">
                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
                    Welcome to Automation
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8">
                    Streamline your workflows with our powerful automation tools. Get started today and boost your productivity.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg">Get Started</Button>
                    <Button variant="outline" size="lg">Learn More</Button>
                </div>
            </div>
        </div>
    )
}