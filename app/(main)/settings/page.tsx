'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User,
    Bell,
    Palette,
    Shield,
    Moon,
    Sun,
    Laptop,
    Lock,
    Key,
    Users,
    Zap,
    Mail,
    Globe,
    Github,
    LogOut,
    Plus,
    Check,
    Terminal,
    Eye,
    EyeOff,
    Info,
    ShieldCheck,
    History,
    AtSign,
    Briefcase,
    ExternalLink
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers'
import { useWorkflows } from '@/services/queries/workflows'
import { credentialsApi } from '@/services/api/credentials'
import { useQuery } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
    const { user, logout } = useAuth()
    const { toast } = useToast()
    const [activeSection, setActiveSection] = useState('profile')
    const [showApiKey, setShowApiKey] = useState(false)
    const { data: workflows = [] } = useWorkflows()
    const { data: credentials = [] } = useQuery({
        queryKey: ['credentials'],
        queryFn: () => credentialsApi.getCredentials()
    })

    const sections = useMemo(() => [
        { id: 'profile', label: 'My Profile', icon: User, description: 'Manage your personal identity' },
        { id: 'security', label: 'Security', icon: Shield, description: 'Safety and authentication' },
        { id: 'workspace', label: 'Workspace', icon: Users, description: 'Collaborate with your team' },
        { id: 'api', label: 'API Keys', icon: Terminal, description: 'Access for developers' },
        { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Themes and layouts' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Communication preferences' },
    ], [])

    const activeSectionData = useMemo(() =>
        sections.find(s => s.id === activeSection),
        [activeSection, sections])

    const handleUpdateIdentity = () => {
        toast({
            title: "Identity updated",
            description: "Your profile information has been saved successfully.",
        })
    }

    const handleInviteAgent = () => {
        toast({
            title: "Invite Sent",
            description: "An invitation has been sent to the specified email address.",
        })
    }

    const handleWebhookAction = () => {
        toast({
            title: "Coming soon",
            description: "Webhook management will be available in the next update.",
        })
    }

    return (
        <div className="max-w-[1400px] mx-auto pb-20">
            {/* Header */}
            <div className="mb-10 flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gradient">Settings</h1>
                    <p className="text-muted-foreground text-sm">
                        Enterprise-grade controls for your automation environment.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-[280px_1fr] gap-12">
                {/* Modern Sidebar Navigation */}
                <aside className="space-y-6">
                    <nav className="space-y-1">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-300 relative group",
                                    activeSection === section.id
                                        ? "text-primary bg-primary/5"
                                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <section.icon className={cn("h-4 w-4", activeSection === section.id ? "text-primary" : "group-hover:text-primary transition-colors")} />
                                    <span className="font-medium text-sm">{section.label}</span>
                                </div>
                                {activeSection === section.id && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute left-0 w-1 h-5 bg-primary rounded-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="pt-8 mt-8 border-t border-border">
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out Account
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-8"
                        >
                            {/* Section Header */}
                            <div className="pb-6 border-b border-border">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    {activeSectionData?.icon && <activeSectionData.icon className="h-6 w-6 text-primary" />}
                                    {activeSectionData?.label}
                                </h2>
                                <p className="text-muted-foreground mt-1">{activeSectionData?.description}</p>
                            </div>

                            {/* MY PROFILE */}
                            {activeSection === 'profile' && (
                                <div className="space-y-8">
                                    <Card className="p-8 border-border overflow-hidden relative group/card">
                                        <div className="absolute top-0 right-0 p-8">
                                            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary via-orange-400 to-amber-500 flex items-center justify-center text-white text-3xl font-black shadow-2xl border-4 border-background transition-transform duration-500">
                                                {user?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        </div>

                                        <div className="max-w-xl space-y-8">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                                    <Input defaultValue={user?.full_name || ''} placeholder="Add your name" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Role</Label>
                                                    <div className="relative">
                                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                        <Input className="pl-10" defaultValue="Senior Automations Engineer" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Email</Label>
                                                <div className="relative">
                                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                    <Input className="pl-10" defaultValue={user?.email || ''} readOnly />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About You</Label>
                                                <Textarea
                                                    placeholder="Tell us about yourself..."
                                                    defaultValue="Focusing on agentic workflows and AI-driven automation systems."
                                                />
                                            </div>

                                            <div className="pt-6 flex justify-end gap-3">
                                                <Button variant="ghost">Cancel</Button>
                                                <Button onClick={handleUpdateIdentity} className="px-8 shadow-lg shadow-primary/20">Update Identity</Button>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-8 border-border">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Connected Platforms</h3>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border group/conn">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-background border border-border group-hover/conn:border-primary/50 transition-colors">
                                                        <Github className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold tracking-tight">GitHub</p>
                                                        <p className="text-xs text-emerald-500 font-medium">Synced</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="text-xs">Revoke</Button>
                                            </div>
                                            <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border group/conn">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-background border border-border group-hover/conn:border-primary/50 transition-colors">
                                                        <Globe className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold tracking-tight text-muted-foreground">Google Cloud</p>
                                                        <p className="text-xs text-muted-foreground/60">Disconnected</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" className="text-xs">Connect</Button>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* SECURITY */}
                            {activeSection === 'security' && (
                                <div className="space-y-6">
                                    <Card className="p-8 border-border max-w-2xl">
                                        <div className="flex items-center gap-3 mb-8">
                                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                            <h3 className="font-bold">Password Security</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Current Password</Label>
                                                <Input type="password" placeholder="••••••••" />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">New Password</Label>
                                                    <Input type="password" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Confirm New</Label>
                                                    <Input type="password" />
                                                </div>
                                            </div>
                                            <Button className="w-full mt-4">Update Password</Button>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* WORKSPACE */}
                            {activeSection === 'workspace' && (
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-[1fr_350px] gap-8">
                                        <Card className="p-8 border-border">
                                            <h3 className="text-lg font-bold mb-6 tracking-tight">Workspace Metadata</h3>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Workspace Name</Label>
                                                    <Input defaultValue="Main Workspace" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Subdomain</Label>
                                                    <div className="flex">
                                                        <div className="px-4 flex items-center bg-muted border border-r-0 border-border rounded-l-xl text-xs font-mono text-muted-foreground">
                                                            app.fuse.io/
                                                        </div>
                                                        <Input className="rounded-l-none" defaultValue="main" />
                                                    </div>
                                                </div>
                                                <div className="pt-4 flex justify-end">
                                                    <Button onClick={() => toast({ title: "Workspace saved" })} variant="outline">Save Changes</Button>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-8 border-border bg-gradient-to-b from-primary/5 to-transparent">
                                            <h3 className="font-bold mb-4 italic text-muted-foreground">Metrics</h3>
                                            <div className="space-y-6 mt-8">
                                                <div className="flex justify-between items-end border-b border-border pb-4">
                                                    <span className="text-xs text-muted-foreground font-medium">Total Workflows</span>
                                                    <span className="text-2xl font-black tracking-tighter">{workflows.length}</span>
                                                </div>
                                                <div className="flex justify-between items-end border-b border-border pb-4">
                                                    <span className="text-xs text-muted-foreground font-medium">Linked Credentials</span>
                                                    <span className="text-2xl font-black tracking-tighter">{credentials.length}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    <Card className="p-8 border-border">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="font-bold text-lg">Team Members</h3>
                                                <p className="text-xs text-muted-foreground">Active collaborators in this workspace.</p>
                                            </div>
                                            <Button onClick={handleInviteAgent} size="sm" className="gap-2 rounded-full shadow-lg shadow-primary/10">
                                                <Plus className="h-4 w-4" />
                                                Invite Member
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { name: user?.full_name || 'Admin User', role: 'Owner', status: 'Online', avatar: user?.full_name?.charAt(0) || 'U' },
                                                { name: 'System Bot', role: 'System', status: 'Active', avatar: '🤖' },
                                            ].map((member, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/40 transition-all border border-transparent hover:border-border group/member">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-muted to-muted/10 flex items-center justify-center font-bold text-xs border border-border group-hover/member:border-primary/30 transition-colors">
                                                            {member.avatar}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold tracking-tight">{member.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <Badge variant="outline" className="text-[9px] px-1.5 h-4 uppercase">{member.role}</Badge>
                                                                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                                                <span className="text-[10px] text-muted-foreground">{member.status}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* API KEYS */}
                            {activeSection === 'api' && (
                                <div className="space-y-8">
                                    <Card className="p-8 border-border bg-gradient-to-br from-muted/20 to-transparent relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Terminal className="h-32 w-32" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">Developer Access Tokens</h3>
                                        <p className="text-sm text-muted-foreground mb-8 max-w-xl">
                                            Use these keys to authenticate your external scripts with the Fuse API.
                                        </p>

                                        <div className="space-y-6 relative z-10">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-muted-foreground">Secret Token</Label>
                                                <div className="flex gap-3">
                                                    <div className="flex-1 relative">
                                                        <Input
                                                            type={showApiKey ? 'text' : 'password'}
                                                            value="fs_live_51Pkhd8f8A9s7D6f5g4h3j2k1l0m9n8b7"
                                                            readOnly
                                                            className="font-mono text-xs pr-12 bg-background border-dashed"
                                                        />
                                                        <button
                                                            onClick={() => setShowApiKey(!showApiKey)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                    <Button variant="outline" onClick={() => {
                                                        navigator.clipboard.writeText("fs_live_51Pkhd8f8A9s7D6f5g4h3j2k1l0m9n8b7");
                                                        toast({ title: "Copied to clipboard" });
                                                    }} className="gap-2">
                                                        Copy
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400">
                                                <Info className="h-4 w-4" />
                                                <p className="text-xs font-medium">Never share your API keys in public repositories.</p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-8 border-border">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="font-bold">Active Webhooks</h3>
                                            <Button size="sm" variant="outline" onClick={handleWebhookAction} className="rounded-full">Manage Webhooks</Button>
                                        </div>
                                        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-muted/5">
                                            <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Globe className="h-6 w-6 text-muted-foreground/30" />
                                            </div>
                                            <h4 className="font-semibold mb-1">No webhooks registered</h4>
                                            <p className="text-xs text-muted-foreground mb-6">Receive real-time events when your flows complete.</p>
                                            <Button size="sm" onClick={handleWebhookAction}>Register Webhook</Button>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* APPEARANCE */}
                            {activeSection === 'appearance' && (
                                <Card className="p-8 border-border">
                                    <h2 className="text-xl font-semibold mb-6 italic text-muted-foreground">Interface Theme</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {[
                                            { id: 'light', label: 'Light', icon: Sun },
                                            { id: 'dark', label: 'Dark', icon: Moon },
                                            { id: 'system', label: 'System', icon: Laptop },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTheme(t.id)}
                                                className={cn(
                                                    "flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all duration-300 relative group/theme overflow-hidden",
                                                    theme === t.id
                                                        ? "border-primary bg-primary/5 shadow-xl shadow-primary/5"
                                                        : "border-border hover:border-primary/40 hover:bg-muted/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center mb-1 transition-all duration-300",
                                                    theme === t.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover/theme:text-primary"
                                                )}>
                                                    <t.icon className="h-6 w-6" />
                                                </div>
                                                <span className="text-sm font-bold tracking-tight">{t.label}</span>
                                                {theme === t.id && (
                                                    <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in-50">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* NOTIFICATIONS */}
                            {activeSection === 'notifications' && (
                                <Card className="p-8 border-border">
                                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        Notification Center
                                    </h2>
                                    <div className="space-y-1">
                                        {[
                                            { title: 'Workflow Executed', desc: 'Alert when a task completes its logic successfully.', icon: Zap },
                                            { title: 'System Alerts', desc: 'Critical alerts for node crashes or timeouts.', icon: Shield },
                                            { title: 'Collaboration', desc: 'When team members edit your workflows.', icon: Users },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between py-5 px-5 rounded-2xl hover:bg-muted/20 transition-all border border-transparent hover:border-border">
                                                <div className="flex items-center gap-4 flex-1 pr-4">
                                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                                        {item.icon && <item.icon className="h-5 w-5 text-muted-foreground" />}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-bold">{item.title}</p>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 p-6 rounded-2xl bg-muted/20 border border-border flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold mb-1">Weekly Intelligence Digest</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Get a weekly report analyzing your pipeline performance and suggesting system optimizations.
                                            </p>
                                            <Button variant="link" className="p-0 h-auto text-[10px] mt-2 font-black uppercase text-primary">
                                                Go to Documentation <ExternalLink className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}
