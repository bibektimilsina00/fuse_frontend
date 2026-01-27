# 🎨 Fuse Dashboard

The frontend component of the Fuse automation platform. A high-performance, futuristic dashboard built with **Next.js 15**, **React Flow**, and **Tailwind CSS**.

## 🚀 Getting Started

Ensure you have [Node.js 18+](https://nodejs.org/) installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

## 🛠 Features

- **Visual Workflow Builder**: Full-featured canvas with drag-and-drop, zoom, and auto-layout.
- **Real-time Observability**: Live log streaming from the backend via WebSockets.
- **Node Configuration Panel**: Dynamic forms for configuring workflow nodes.
- **Credential Management**: Securely manage OAuth and API key credentials.
- **Glassmorphism UI**: A premium, futuristic aesthetic with dark mode support.

## 📁 Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components.
- `services/`: API clients and state management.
- `hooks/`: Custom React hooks for workflow logic.

## ⚙️ Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```
