import PluginDetailClient from './PluginDetailClient'

// Required for 'output: export' with dynamic routes
export async function generateStaticParams() {
    return [
        { id: 'google-ai-antigravity' }
    ]
}

export default function PluginDetailPage() {
    return <PluginDetailClient />
}
