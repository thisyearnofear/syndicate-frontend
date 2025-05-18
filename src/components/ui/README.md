# UI Components Organization

This directory contains all the reusable UI components organized by category.

## Categories

- **data-display**: Components that display data (Card, Table, Avatar, etc.)
- **inputs**: Form controls and input components (Input, Select, Checkbox, etc.)
- **feedback**: Components that provide feedback to users (Alert, Progress, Skeleton, etc.)
- **navigation**: Navigation-related components (Tabs, Pagination, Breadcrumb, etc.)
- **layout**: Layout components (AspectRatio, Separator, etc.)
- **overlay**: Components that overlay the UI (Dialog, Drawer, Tooltip, etc.)
- **typography**: Text-related components
- **utils**: Utility components (ErrorBoundary, LazyComponent, etc.)

## Usage

Import components using the path alias:

```tsx
import { Button } from "@/components/ui/inputs/button";
import { Card } from "@/components/ui/data-display/card";
```
