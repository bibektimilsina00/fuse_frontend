import ClientWrapper from './ClientWrapper'

// For static export - disable dynamic params to allow non-pre-generated UUID routes
export const dynamicParams = false

// Required for static export - returns one placeholder path
// Client-side navigation will work for any ID
export async function generateStaticParams() {
    return [{ id: 'new' }]  // Placeholder for /workflows/new
}

// Server component that renders the client wrapper
export default function Page() {
    return <ClientWrapper />
}
