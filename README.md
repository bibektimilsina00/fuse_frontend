# 🎨 Fuse Frontend: Premium Workflow Architect

The **Fuse Frontend** is a cutting-edge web application that serves as the visual command center for the Fuse platform. Designed with **Next.js 15** and **React Flow**, it provides an elite-tier experience for designing, managing, and observing complex AI-powered automations.

---

## 💎 Design Philosophy: "Futuristic Glassmorphism"

Fuse is not just a tool; it's a workspace designed to inspire.
- **Premium Aesthetics**: A curated dark-mode experience using deep charcoal, vibrant cyans, and soft glassmorphic overlays.
- **Fluid Interactions**: Micro-animations and smooth transitions powered by **Framer Motion**.
- **Responsive Layouts**: Fully adaptive interface designed to maintain clarity across all screen sizes.

---

## 🚀 Key Architectures

### 1. Unified Workflow Designer
The crown jewel of the platform, built on an optimized implementation of **React Flow**.
- **Dynamic Node Interaction**: Drag, snap, and connect nodes with intuitive performance.
- **Real-time Stream Integration**: Execution logs are streamed through the canvas, providing immediate visual feedback on workflow progress and data flow.

### 2. Node Development GUI
Fuse empowers developers to build their own tools without switching contexts.
- **In-Browser IDE**: Edit node logic (Python/JS) using a syntax-highlighted editor.
- **Visual Manifest Builder**: Configure categories, metadata, and input/output sockets through a clean, guided interface.
- **Hot-Reloading**: Changes to custom nodes are reflected instantly in the designer's side panel.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Visual Logic**: [React Flow](https://reactflow.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query) & [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 📦 Local Development

### Prerequisites
- Node.js 20+
- npm or pnpm

### Setup and Launch

```bash
# Clone the repository and enter the frontend directory
cd fuse_frontend

# Install professional dependencies
npm install

# Launch the development server
npm run dev
```

The architect will be live at `http://localhost:3000`.

---

## ⚙️ Environment Configuration

Create a `.env.local` to connect the architect to your backend engine.

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The REST API endpoint of the Fuse Engine (default: `http://localhost:8000/api/v1`). |
| `NEXT_PUBLIC_WS_URL` | The WebSocket endpoint for real-time log streaming (default: `ws://localhost:8000/ws`). |

---

## 📂 Component Directory Structure

- `app/`: Next.js 15 App Router pages, layouts, and global providers.
- `components/`: Atomic and composite UI components.
    - `workflow/`: All components related to the visual designer and canvas.
    - `ui/`: Reusable, generic UI primitives (buttons, inputs, glass cards).
- `services/`: API integration layer and client-side business logic.
- `hooks/`: Specialized React hooks for React Flow integration and platform events.
- `lib/`: Utility functions and shared TypeScript interfaces.

---

**Crafted with ⚡ by [Bibek Timilsina](https://github.com/bibektimilsina)**
*Design. Design. Iterate.* 🌊
