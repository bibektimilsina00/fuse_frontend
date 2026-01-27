'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nodesApi, NodeManifest, NodeInputSchema, NodeOutputSchema } from '@/services/api/nodes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Textarea, Label, Badge } from '@/components/ui';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Save, Trash2, Plus, Code, Settings, Database, Cpu, ArrowLeft, Upload, FileJson } from 'lucide-react';
import Editor from '@monaco-editor/react';

// Types for form state
interface NodeEditorProps {
    mode: 'create' | 'edit';
    initialData?: any;
    nodeId?: string;
}

const DEFAULT_MANIFEST: NodeManifest = {
    id: '',
    name: '',
    version: '1.0.0',
    category: 'custom',
    description: '',
    inputs: [],
    outputs: [],
    tags: []
};

const DEFAULT_CODE = `
def execute(inputs: dict) -> dict:
    """
    Execute the node logic.
    
    Args:
        inputs: Dictionary containing input values defined in manifest
        
    Returns:
        Dictionary containing output values defined in manifest
    """
    # Your code here
    result = f"Hello {inputs.get('name', 'World')}"
    
    return {
        "result": result
    }
`;

export default function NodeEditor({ mode, initialData, nodeId }: NodeEditorProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [manifest, setManifest] = useState<NodeManifest>(initialData?.manifest || DEFAULT_MANIFEST);
    const [code, setCode] = useState<string>(initialData?.code || DEFAULT_CODE);
    const [activeTab, setActiveTab] = useState('general');
    const [iconFile, setIconFile] = useState<File | null>(null);

    // Synchronize initial data if loaded late (for edit mode)
    useEffect(() => {
        if (initialData) {
            setManifest(initialData.manifest);
            setCode(initialData.code || DEFAULT_CODE);
        }
    }, [initialData]);

    const createMutation = useMutation({
        mutationFn: nodesApi.create,
        onSuccess: (data) => {
            toast({ title: 'Success', description: 'Node created successfully' });
            // Upload icon if selected
            if (iconFile) {
                nodesApi.uploadIcon(data.id, iconFile);
            }
            router.push('/nodes');
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.detail || 'Failed to create node', variant: 'destructive' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => nodesApi.update(nodeId!, data),
        onSuccess: () => {
            toast({ title: 'Success', description: 'Node updated successfully' });
            if (iconFile) {
                nodesApi.uploadIcon(nodeId!, iconFile);
            }
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
            queryClient.invalidateQueries({ queryKey: ['node', nodeId] });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.detail || 'Failed to update node', variant: 'destructive' });
        }
    });

    const handleSave = () => {
        if (mode === 'create') {
            createMutation.mutate({ manifest, code });
        } else {
            updateMutation.mutate({ manifest, code });
        }
    };

    const handleInputChange = (field: keyof NodeManifest, value: any) => {
        setManifest(prev => ({ ...prev, [field]: value }));
    };

    // Input Schema Management
    const addInput = () => {
        setManifest(prev => ({
            ...prev,
            inputs: [...prev.inputs, { name: 'new_input', type: 'string', label: 'New Input', required: true }]
        }));
    };

    const updateInput = (index: number, field: keyof NodeInputSchema, value: any) => {
        const newInputs = [...manifest.inputs];
        newInputs[index] = { ...newInputs[index], [field]: value };
        setManifest(prev => ({ ...prev, inputs: newInputs }));
    };

    const removeInput = (index: number) => {
        setManifest(prev => ({
            ...prev,
            inputs: prev.inputs.filter((_, i) => i !== index)
        }));
    };

    // Output Schema Management
    const addOutput = () => {
        setManifest(prev => ({
            ...prev,
            outputs: [...prev.outputs, { name: 'result', type: 'string', label: 'Result' }]
        }));
    };

    const updateOutput = (index: number, field: keyof NodeOutputSchema, value: any) => {
        const newOutputs = [...manifest.outputs];
        newOutputs[index] = { ...newOutputs[index], [field]: value };
        setManifest(prev => ({ ...prev, outputs: newOutputs }));
    };

    const removeOutput = (index: number) => {
        setManifest(prev => ({
            ...prev,
            outputs: prev.outputs.filter((_, i) => i !== index)
        }));
    };

    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIconFile(e.target.files[0]);
        }
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            {mode === 'create' ? 'Create New Node' : `Edit ${manifest.name}`}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {mode === 'create' ? 'Define inputs, outputs, and logic for your custom node.' : `ID: ${manifest.id}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {mode === 'create' ? 'Create Node' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                        <TabsTrigger value="general">
                            <Settings className="w-4 h-4 mr-2" />
                            General & Icon
                        </TabsTrigger>
                        <TabsTrigger value="inputs">
                            <Database className="w-4 h-4 mr-2" />
                            Inputs & Outputs
                        </TabsTrigger>
                        <TabsTrigger value="code">
                            <Code className="w-4 h-4 mr-2" />
                            Implementation
                        </TabsTrigger>
                        <TabsTrigger value="json">
                            <FileJson className="w-4 h-4 mr-2" />
                            JSON Preview
                        </TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Define the identity of your node.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="node-id">Node ID (unique)</Label>
                                        <Input
                                            id="node-id"
                                            value={manifest.id}
                                            onChange={(e) => handleInputChange('id', e.target.value)}
                                            placeholder="e.g., custom.my_node"
                                            disabled={mode === 'edit'}
                                        />
                                        <p className="text-xs text-muted-foreground">dots permitted, no spaces.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="node-name">Display Name</Label>
                                        <Input
                                            id="node-name"
                                            value={manifest.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="e.g., My Custom Node"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={manifest.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                                        placeholder="Describe what this node does..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            value={manifest.category}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            placeholder="e.g., custom, tools, ai"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="version">Version</Label>
                                        <Input
                                            id="version"
                                            value={manifest.version}
                                            onChange={(e) => handleInputChange('version', e.target.value)}
                                            placeholder="1.0.0"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Icon</CardTitle>
                                <CardDescription>Upload an SVG icon for your node.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {initialData?.has_icon && !iconFile && (
                                        <div className="w-12 h-12 border rounded flex items-center justify-center bg-muted">
                                            <img src={`/api/v1/nodes/${nodeId}/icon`} alt="Current Icon" className="w-8 h-8" />
                                        </div>
                                    )}
                                    <Input type="file" accept=".svg" onChange={handleIconUpload} />
                                </div>
                                <p className="text-xs text-muted-foreground">Only .svg files are supported. Recommended size: 24x24px.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Inputs/Outputs Tab */}
                    <TabsContent value="inputs" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inputs Column */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Inputs</h3>
                                    <Button variant="outline" size="sm" onClick={addInput}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Input
                                    </Button>
                                </div>
                                {manifest.inputs.map((input, idx) => (
                                    <Card key={idx}>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="grid grid-cols-2 gap-2 w-full pr-4">
                                                    <Input
                                                        value={input.name}
                                                        onChange={(e) => updateInput(idx, 'name', e.target.value)}
                                                        placeholder="name (key)"
                                                        className="h-8"
                                                    />
                                                    <Input
                                                        value={input.label}
                                                        onChange={(e) => updateInput(idx, 'label', e.target.value)}
                                                        placeholder="Label"
                                                        className="h-8"
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeInput(idx)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <select
                                                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    value={input.type}
                                                    onChange={(e) => updateInput(idx, 'type', e.target.value)}
                                                >
                                                    <option value="string">String</option>
                                                    <option value="number">Number</option>
                                                    <option value="boolean">Boolean</option>
                                                    <option value="json">JSON</option>
                                                    <option value="select">Select</option>
                                                </select>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`req-${idx}`}
                                                        checked={input.required}
                                                        onChange={(e) => updateInput(idx, 'required', e.target.checked)}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    <Label htmlFor={`req-${idx}`} className="text-xs">Required</Label>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {manifest.inputs.length === 0 && (
                                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                                        No inputs defined.
                                    </div>
                                )}
                            </div>

                            {/* Outputs Column */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Outputs</h3>
                                    <Button variant="outline" size="sm" onClick={addOutput}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Output
                                    </Button>
                                </div>
                                {manifest.outputs.map((output, idx) => (
                                    <Card key={idx}>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="grid grid-cols-2 gap-2 w-full pr-4">
                                                    <Input
                                                        value={output.name}
                                                        onChange={(e) => updateOutput(idx, 'name', e.target.value)}
                                                        placeholder="name (key)"
                                                        className="h-8"
                                                    />
                                                    <Input
                                                        value={output.label}
                                                        onChange={(e) => updateOutput(idx, 'label', e.target.value)}
                                                        placeholder="Label"
                                                        className="h-8"
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeOutput(idx)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <select
                                                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    value={output.type}
                                                    onChange={(e) => updateOutput(idx, 'type', e.target.value)}
                                                >
                                                    <option value="string">String</option>
                                                    <option value="number">Number</option>
                                                    <option value="boolean">Boolean</option>
                                                    <option value="json">JSON</option>
                                                    <option value="any">Any</option>
                                                </select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {manifest.outputs.length === 0 && (
                                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                                        No outputs defined.
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Code Tab */}
                    <TabsContent value="code" className="h-[600px]">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="py-3 px-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Cpu className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <span className="font-mono text-sm">backend/execute.py</span>
                                    </div>
                                    <Badge variant="outline">Python 3.10+</Badge>
                                </div>
                            </CardHeader>
                            <div className="flex-1 min-h-0">
                                <Editor
                                    height="100%"
                                    defaultLanguage="python"
                                    value={code}
                                    onChange={(val) => setCode(val || '')}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                            </div>
                        </Card>
                    </TabsContent>

                    {/* JSON Preview Tab */}
                    <TabsContent value="json" className="h-[600px]">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="py-3 px-4 border-b">
                                <div className="flex items-center">
                                    <FileJson className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="font-mono text-sm">manifest.json</span>
                                </div>
                            </CardHeader>
                            <div className="flex-1 min-h-0 p-0 overflow-hidden">
                                <Editor
                                    height="100%"
                                    defaultLanguage="json"
                                    value={JSON.stringify(manifest, null, 2)}
                                    theme="vs-dark"
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 13
                                    }}
                                />
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
