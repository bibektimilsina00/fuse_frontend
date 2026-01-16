'use client'

import { AICreateDialog } from '@/components/ai/AICreateDialog'
import { Button } from '@/components/ui/Button'
import { Sparkles, Wand2, Zap } from 'lucide-react'

/**
 * Example usage of the AICreateDialog component
 * This can be integrated into your dashboard or any other page
 */
import { logger } from '@/lib/logger'

export default function AICreateExample() {
    const handleAICreate = async (prompt: string) => {
        logger.info('Creating with AI:', { prompt })

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Here you would typically:
        // 1. Send the prompt to your backend AI service
        // 2. Get the generated workflow/content
        // 3. Navigate to the editor or show success message

        alert(`AI will create: ${prompt}`)
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">
                        AI Create Dialog Examples
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Different variations of the AI creation button and dialog
                    </p>
                </div>

                {/* Examples Grid */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Default Button */}
                    <div className="glass p-6 rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold">Default Button</h3>
                        <p className="text-sm text-muted-foreground">
                            The default AI creation button with animated gradient on hover
                        </p>
                        <AICreateDialog onSubmit={handleAICreate} />
                    </div>

                    {/* Custom Trigger - Large Button */}
                    <div className="glass p-6 rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold">Large Button</h3>
                        <p className="text-sm text-muted-foreground">
                            Custom trigger with larger size
                        </p>
                        <AICreateDialog
                            trigger={
                                <Button size="lg" className="w-full group">
                                    <Wand2 className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                                    Create Workflow with AI
                                </Button>
                            }
                            onSubmit={handleAICreate}
                        />
                    </div>

                    {/* Custom Trigger - Outline Button */}
                    <div className="glass p-6 rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold">Outline Variant</h3>
                        <p className="text-sm text-muted-foreground">
                            Outline button style for secondary actions
                        </p>
                        <AICreateDialog
                            trigger={
                                <Button variant="outline" className="w-full">
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    AI Assistant
                                </Button>
                            }
                            title="AI Assistant"
                            description="Tell me what you need help with"
                            placeholder="E.g., Help me automate my email responses..."
                            onSubmit={handleAICreate}
                        />
                    </div>

                    {/* Custom Trigger - Icon Button */}
                    <div className="glass p-6 rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold">Icon Button</h3>
                        <p className="text-sm text-muted-foreground">
                            Compact icon-only button
                        </p>
                        <AICreateDialog
                            trigger={
                                <Button size="icon" variant="outline">
                                    <Zap className="h-4 w-4" />
                                </Button>
                            }
                            onSubmit={handleAICreate}
                        />
                    </div>

                    {/* Custom Card Trigger */}
                    <div className="glass p-6 rounded-lg space-y-4 md:col-span-2">
                        <h3 className="text-lg font-semibold">Custom Card Trigger</h3>
                        <p className="text-sm text-muted-foreground">
                            Use any custom element as a trigger
                        </p>
                        <AICreateDialog
                            trigger={
                                <button className="w-full p-6 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 hover:border-primary/40 transition-all group text-left">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <h4 className="text-lg font-semibold flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-primary" />
                                                Start with AI
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Describe your automation and let AI build it
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Wand2 className="h-6 w-6" />
                                        </div>
                                    </div>
                                </button>
                            }
                            onSubmit={handleAICreate}
                        />
                    </div>
                </div>

                {/* Integration Example */}
                <div className="glass p-8 rounded-lg space-y-4">
                    <h3 className="text-xl font-semibold">Integration Example</h3>
                    <p className="text-muted-foreground">
                        Here's how to integrate the AI Create Dialog into your dashboard:
                    </p>
                    <pre className="bg-background/50 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{`import { AICreateDialog } from '@/components/ui/AICreateDialog'

// In your dashboard component:
<AICreateDialog 
  onSubmit={async (prompt) => {
    // Send to your AI service
    const workflow = await createWorkflowWithAI(prompt)
    // Navigate to editor
    router.push(\`/workflows/\${workflow.id}\`)
  }}
/>`}</code>
                    </pre>
                </div>
            </div>
        </div>
    )
}
