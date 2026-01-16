'use client'

import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Loader2, CheckCircle, XCircle, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useExecuteCode } from '@/services/queries/workflows'

interface CodeEditorProps {
    value: string
    onChange: (value: string) => void
    language: 'python' | 'javascript'
    height?: string
    nodeId?: string
    workflowId?: string
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    onChange,
    language,
    height = '400px',
    nodeId,
    workflowId
}) => {
    const executeCodeMutation = useExecuteCode()
    const [output, setOutput] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [isFullscreen, setIsFullscreen] = useState(false)

    const handleEditorChange = (value: string | undefined) => {
        onChange(value || '')
    }

    const handleRunCode = async () => {
        setOutput('')
        setError('')

        executeCodeMutation.mutate(
            {
                code: value,
                language,
                // Pass context via inputData since API doesn't support node_id/workflow_id directly
                inputData: nodeId || workflowId ? { node_id: nodeId, workflow_id: workflowId } : undefined
            },
            {
                onSuccess: (response) => {
                    setOutput(response.output || 'Code executed successfully!')
                },
                onError: (err: Error) => {
                    setError(err.message || 'Failed to execute code')
                }
            }
        )
    }

    const getDefaultCode = () => {
        if (language === 'python') {
            return `# Python Script
# Available variables:
# - input_data: Data from previous node
# - context: Workflow context

def main(input_data, context):
    # Your code here
    result = {
        "message": "Hello from Python!",
        "input": input_data
    }
    return result

# Return value will be passed to next node
return main(input_data, context)`
        } else {
            return `// JavaScript Script
// Available variables:
// - inputData: Data from previous node
// - context: Workflow context

function main(inputData, context) {
    // Your code here
    const result = {
        message: "Hello from JavaScript!",
        input: inputData
    };
    return result;
}

// Return value will be passed to next node
return main(inputData, context);`
        }
    }

    const editorOptions = {
        minimap: { enabled: !isFullscreen },
        fontSize: 14,
        lineNumbers: 'on' as const,
        roundedSelection: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: language === 'python' ? 4 : 2,
        insertSpaces: true,
        wordWrap: 'on' as const,
        theme: 'vs-dark',
        padding: { top: 16, bottom: 16 }
    }

    return (
        <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {language === 'python' ? '🐍 Python' : '⚡ JavaScript'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {value.split('\n').length} lines
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="h-7 px-2"
                    >
                        {isFullscreen ? (
                            <Minimize2 className="h-3.5 w-3.5" />
                        ) : (
                            <Maximize2 className="h-3.5 w-3.5" />
                        )}
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleRunCode}
                        disabled={executeCodeMutation.isPending || !value.trim()}
                        className="h-7 px-3"
                    >
                        {executeCodeMutation.isPending ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play className="h-3.5 w-3.5 mr-1.5" />
                                Test Run
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden shadow-lg">
                <Editor
                    height={isFullscreen ? 'calc(100vh - 200px)' : height}
                    defaultLanguage={language}
                    language={language}
                    value={value || getDefaultCode()}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={editorOptions}
                    loading={
                        <div className="flex items-center justify-center h-full bg-slate-950">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    }
                />
            </div>

            {/* Output Panel */}
            {(output || error) && (
                <div className="mt-3 border border-border rounded-xl overflow-hidden">
                    <div className={`px-4 py-2 flex items-center gap-2 text-sm font-semibold ${error ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                        {error ? (
                            <>
                                <XCircle className="h-4 w-4" />
                                Execution Failed
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                Execution Successful
                            </>
                        )}
                    </div>
                    <div className="p-4 bg-slate-950 text-slate-100 font-mono text-sm max-h-48 overflow-auto">
                        <pre className="whitespace-pre-wrap">{error || output}</pre>
                    </div>
                </div>
            )}

            {/* Helper Text */}
            <div className="mt-2 px-1 text-xs text-muted-foreground">
                💡 Tip: Use <code className="px-1 py-0.5 bg-muted rounded">input_data</code> to access data from the previous node.
                Press <code className="px-1 py-0.5 bg-muted rounded">Ctrl/Cmd + S</code> to save.
            </div>
        </div>
    )
}
