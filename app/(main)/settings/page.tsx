'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { User, Bell, Palette, Shield, Moon, Sun, Laptop } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
    const { setTheme } = useTheme()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Appearance
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card className="p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Profile Information</h3>
                            <p className="text-sm text-muted-foreground">
                                Update your account's profile information and email address.
                            </p>
                        </div>
                        <div className="grid gap-4 max-w-xl">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input placeholder="Your name" defaultValue="User Account" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input placeholder="Email address" defaultValue="user@example.com" />
                            </div>
                            <Button className="w-fit">Save Changes</Button>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance">
                    <Card className="p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Appearance</h3>
                            <p className="text-sm text-muted-foreground">
                                Customize the look and feel of the application.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 max-w-xl">
                            <button
                                onClick={() => setTheme('light')}
                                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-muted hover:border-primary transition-colors"
                            >
                                <Sun className="h-6 w-6" />
                                <span className="text-sm font-medium">Light</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-muted hover:border-primary transition-colors"
                            >
                                <Moon className="h-6 w-6" />
                                <span className="text-sm font-medium">Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-muted hover:border-primary transition-colors"
                            >
                                <Laptop className="h-6 w-6" />
                                <span className="text-sm font-medium">System</span>
                            </button>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card className="p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Notifications</h3>
                            <p className="text-sm text-muted-foreground">
                                Configure how you receive notifications.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {['Email Notifications', 'Push Notifications', 'Workflow Alerts', 'Weekly Digest'].map((item) => (
                                <div key={item} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                                    <span className="text-sm font-medium">{item}</span>
                                    <div className="h-6 w-11 bg-primary/10 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 h-4 w-4 bg-primary rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
