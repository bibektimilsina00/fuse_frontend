'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    HelpCircle,
    Book,
    MessageCircle,
    Video,
    FileText,
    Search,
    ChevronRight,
    ExternalLink,
    Mail,
    Github,
    Zap,
    Code,
    Settings,
    Workflow
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const quickLinks = [
    {
        title: 'Getting Started',
        description: 'Learn the basics of creating your first workflow',
        icon: Zap,
        href: '#',
        color: 'from-orange-500/20 to-amber-500/20'
    },
    {
        title: 'Node Reference',
        description: 'Complete documentation for all available nodes',
        icon: Code,
        href: '#',
        color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
        title: 'API Documentation',
        description: 'Integrate Fuse with your applications',
        icon: FileText,
        href: '#',
        color: 'from-purple-500/20 to-indigo-500/20'
    },
    {
        title: 'Video Tutorials',
        description: 'Watch step-by-step workflow tutorials',
        icon: Video,
        href: '#',
        color: 'from-red-500/20 to-pink-500/20'
    }
]

const faqs = [
    {
        question: 'How do I create my first workflow?',
        answer: 'Click on "Create Workflow" button in the sidebar, then add nodes by clicking the "+" button on the canvas. Connect nodes by dragging from one node\'s output to another node\'s input.'
    },
    {
        question: 'How do credentials work?',
        answer: 'Credentials store your API keys and OAuth tokens securely. You can create credentials in the Credentials page and reference them in your workflow nodes. All sensitive data is encrypted.'
    },
    {
        question: 'Can I schedule workflows to run automatically?',
        answer: 'Yes! Use the Schedule trigger node to run your workflow at specific intervals or times. You can configure cron expressions for complex scheduling needs.'
    },
    {
        question: 'How do I debug failed workflows?',
        answer: 'Go to the Executions page to see the history of all workflow runs. Click on any execution to see detailed logs, including input/output data for each node.'
    },
    {
        question: 'What is a webhook trigger?',
        answer: 'A webhook trigger starts your workflow when it receives an HTTP request. Each webhook has a unique URL that you can call from external services.'
    }
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-border last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 text-left"
            >
                <span className="font-medium">{question}</span>
                <ChevronRight className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    isOpen && "rotate-90"
                )} />
            </button>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pb-4"
                >
                    <p className="text-muted-foreground text-sm">{answer}</p>
                </motion.div>
            )}
        </div>
    )
}

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="space-y-8 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight">How can we help you?</h1>
                <p className="text-muted-foreground mt-2">
                    Find answers, explore documentation, or reach out to our support team
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg"
                />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link, i) => (
                    <motion.a
                        key={i}
                        href={link.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all"
                    >
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br mb-4", link.color)}>
                            <link.icon className="h-6 w-6 text-foreground" />
                        </div>
                        <h3 className="font-medium mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                            {link.title}
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-muted-foreground">{link.description}</p>
                    </motion.a>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Frequently Asked Questions
                </h2>
                <div className="divide-y divide-border">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>

            {/* Contact Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Chat Support</h3>
                            <p className="text-sm text-muted-foreground">Get help from our team</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Our support team is available 24/7 to help you with any questions or issues.
                    </p>
                    <Button>
                        Start Chat
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Email Support</h3>
                            <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Send us an email at <span className="text-foreground font-medium">support@fuse.io</span>
                    </p>
                    <Button variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                    </Button>
                </div>
            </div>

            {/* Community */}
            <div className="text-center py-8">
                <h3 className="font-semibold mb-2">Join our Community</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Connect with other Fuse users and get help from the community
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Button variant="outline" className="gap-2">
                        <Github className="h-4 w-4" />
                        GitHub Discussions
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Discord Server
                    </Button>
                </div>
            </div>
        </div>
    )
}
