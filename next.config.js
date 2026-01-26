/** @type {import('next').NextConfig} */
const allowedDevOrigins = process.env.NEXT_ALLOWED_DEV_ORIGINS
    ? process.env.NEXT_ALLOWED_DEV_ORIGINS.split(',').map((s) => s.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.18.16:3000']

const nextConfig = {
    reactStrictMode: true,
    // Only use static export in production build
    output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
    trailingSlash: true,  // Required for static export routing
    images: {
        unoptimized: true,  // Required for static export
    },
    // When developing on LAN or through a different hostname/IP (e.g. phone or VM),
    // Next.js may warn about cross-origin requests for `/_next/*` resources. To allow
    // those dev origins, set NEXT_ALLOWED_DEV_ORIGINS env var (comma-separated) or
    // add them below to silence the runtime warning.
    allowedDevOrigins,
}

module.exports = nextConfig
