# Trigger Nodes Structure

All trigger nodes follow a consistent inverted-D shape design pattern by extending `BaseTriggerNode`.

## Design Philosophy

- **Unique Shape**: All triggers use an inverted-D shape (rounded on the right side) to visually distinguish them from other node types
- **Consistent Layout**: Common UI elements (icon, label, status, details) in the same positions
- **Easy Extension**: New triggers only need to configure icon, colors, and custom details

## File Structure

```
trigger/
├── BaseTriggerNode.tsx          # Base component with inverted-D shape
├── WhatsAppTriggerNode.tsx      # WhatsApp trigger (green theme)
├── EmailTriggerNode.tsx         # Email trigger (blue theme)
└── index.ts                     # Exports
```

## Creating a New Trigger

1. Create a new file: `YourTriggerNode.tsx`

2. Use this template:

```typescript
'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { YourIcon } from 'lucide-react'
import { BaseTriggerNode, BaseTriggerNodeData, TriggerNodeConfig } from './BaseTriggerNode'

interface YourTriggerData extends BaseTriggerNodeData {
    config?: {
        // Your specific config fields
    }
}

const YourDetailsContent = ({ data }: { data: YourTriggerData }) => {
    return (
        <div className="space-y-2">
            {/* Your custom details UI */}
        </div>
    )
}

export const YourTriggerNode = memo((props: NodeProps<YourTriggerData>) => {
    const config: TriggerNodeConfig = {
        icon: YourIcon,
        color: '#your-hex-color',
        gradientFrom: 'from-your-400',
        gradientTo: 'to-your-600',
        iconBgColor: 'white',
        detailsContent: (data) => <YourDetailsContent data={data as YourTriggerData} />,
        isConnected: (data) => {
            // Your connection logic
            return !!(data.config?.someField)
        }
    }

    return <BaseTriggerNode {...props} config={config} />
})

YourTriggerNode.displayName = 'YourTriggerNode'
```

3. Export in `index.ts`:
```typescript
export { YourTriggerNode } from './YourTriggerNode'
```

4. Add to WorkflowBuilder's `nodeTypesMemo`:
```typescript
your_trigger: YourTriggerNode,
```

## Customization Options

### TriggerNodeConfig

- `icon`: Lucide React icon component
- `color`: Hex color for the icon
- `gradientFrom`: Tailwind gradient start class (e.g., 'from-green-400')
- `gradientTo`: Tailwind gradient end class (e.g., 'to-green-600')
- `iconBgColor`: Background color for icon container (default: 'white')
- `detailsContent`: Function returning custom details JSX
- `isConnected`: Function to determine connection status

## Examples

### WhatsApp Trigger
- **Shape**: Inverted-D
- **Color**: Green (#25D366)
- **Icon**: MessageCircle
- **Details**: Phone Number ID, Webhook URL

### Email Trigger
- **Shape**: Inverted-D
- **Color**: Blue (#3b82f6)
- **Icon**: Mail
- **Details**: Email address, IMAP server

Both share the same shape but with different branding!
