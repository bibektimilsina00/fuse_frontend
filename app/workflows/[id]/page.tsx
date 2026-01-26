import ClientWrapper from './ClientWrapper'

// For static export - allow dynamic params (client router handles others)
export const dynamicParams = true

// Required for static export - returns one placeholder path
// Client-side navigation will work for any ID
export async function generateStaticParams() {
    return [{ id: 'new' }]  // Placeholder for /workflows/new
}

// Server component that renders the client wrapper
export default function Page() {
    return <ClientWrapper />
}
