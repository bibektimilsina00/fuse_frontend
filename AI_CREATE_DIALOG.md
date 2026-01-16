# AI Create Dialog Component

A beautiful, premium AI creation dialog component that matches the dashboard's glassmorphism dark theme. This component provides an intuitive interface for users to create workflows and content using AI.

## Features

✨ **Premium Design**
- Glassmorphism effect with backdrop blur
- Animated gradient backgrounds
- Smooth transitions and micro-animations
- Dark mode optimized with primary green accent (#00DC82)

🎨 **Interactive Elements**
- Auto-resizing textarea
- Character counter
- Quick suggestion chips
- Keyboard shortcuts (⌘/Ctrl + Enter to submit)
- Loading states with spinner

♿ **Accessibility**
- Built on Radix UI primitives
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Installation

The component is already installed in your project at:
```
/components/ui/AICreateDialog.tsx
```

## Basic Usage

```tsx
import { AICreateDialog } from '@/components/ui/AICreateDialog'

function MyComponent() {
  const handleCreate = async (prompt: string) => {
    // Send prompt to your AI service
    const result = await createWithAI(prompt)
    console.log('Created:', result)
  }

  return <AICreateDialog onSubmit={handleCreate} />
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `React.ReactNode` | Default button | Custom trigger element |
| `title` | `string` | "Create with AI" | Dialog title |
| `description` | `string` | Default description | Dialog description text |
| `placeholder` | `string` | Default placeholder | Textarea placeholder |
| `onSubmit` | `(prompt: string) => void \| Promise<void>` | - | Callback when user submits |
| `className` | `string` | - | Additional CSS classes for trigger |

## Examples

### Default Button
```tsx
<AICreateDialog onSubmit={handleCreate} />
```

### Custom Trigger - Large Button
```tsx
<AICreateDialog
  trigger={
    <Button size="lg" className="w-full">
      <Wand2 className="h-5 w-5 mr-2" />
      Create Workflow with AI
    </Button>
  }
  onSubmit={handleCreate}
/>
```

### Custom Trigger - Outline Button
```tsx
<AICreateDialog
  trigger={
    <Button variant="outline">
      <Sparkles className="h-4 w-4 mr-2" />
      AI Assistant
    </Button>
  }
  title="AI Assistant"
  description="Tell me what you need help with"
  placeholder="E.g., Help me automate my email responses..."
  onSubmit={handleCreate}
/>
```

### Icon Button
```tsx
<AICreateDialog
  trigger={
    <Button size="icon" variant="outline">
      <Zap className="h-4 w-4" />
    </Button>
  }
  onSubmit={handleCreate}
/>
```

### Custom Card Trigger
```tsx
<AICreateDialog
  trigger={
    <button className="w-full p-6 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 hover:border-primary/40 transition-all group">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Start with AI
          </h4>
          <p className="text-sm text-muted-foreground">
            Describe your automation and let AI build it
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
          <Wand2 className="h-6 w-6" />
        </div>
      </div>
    </button>
  }
  onSubmit={handleCreate}
/>
```

## Integration with Dashboard

The component has been integrated into the dashboard at `/app/(main)/dashboard/page.tsx`:

```tsx
export default function DashboardPage() {
  const handleAICreate = async (prompt: string) => {
    // 1. Send prompt to backend AI service
    const response = await fetch('/api/ai/create-workflow', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })
    
    // 2. Get the generated workflow
    const workflow = await response.json()
    
    // 3. Navigate to workflow editor
    router.push(`/workflows/${workflow.id}`)
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline">View Reports</Button>
      <AICreateDialog onSubmit={handleAICreate} />
      <Link href="/workflows">
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </Link>
    </div>
  )
}
```

## Keyboard Shortcuts

- **⌘/Ctrl + Enter**: Submit the form
- **Escape**: Close the dialog

## Customization

### Changing Suggestions

Edit the suggestions array in `AICreateDialog.tsx`:

```tsx
{[
  'Send daily email reports',
  'Automate data sync',
  'Create notification workflow',
].map((suggestion) => (
  // ...
))}
```

### Styling

The component uses your design system's color tokens:
- `--primary`: Main accent color (#00DC82)
- `--background`: Background color (#020420)
- `--card`: Card background
- `--border`: Border color
- `--muted-foreground`: Secondary text

To customize, update these values in `styles/globals.css`.

## Animation Details

The component includes several animations:
1. **Button hover**: Animated gradient background
2. **Dialog entrance**: Zoom and fade in
3. **Background**: Rotating gradient blur
4. **Wand icon**: Gentle rotation animation
5. **Character counter**: Fade in/out

## Accessibility Features

- Proper ARIA labels
- Keyboard navigation
- Focus trap in dialog
- Screen reader announcements
- Disabled state handling

## Demo Page

Visit `/ai-create-example` to see all variations and usage examples.

## Next Steps

1. **Backend Integration**: Connect the `onSubmit` handler to your AI service
2. **Error Handling**: Add error states and user feedback
3. **Success States**: Show success message or redirect after creation
4. **Analytics**: Track AI creation usage
5. **Customization**: Adjust suggestions based on user context

## Support

For issues or questions, refer to:
- Component source: `/components/ui/AICreateDialog.tsx`
- Example page: `/app/(main)/ai-create-example/page.tsx`
- Dashboard integration: `/app/(main)/dashboard/page.tsx`
